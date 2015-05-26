import Collection = require('pkg/Collection/Collection');
import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import Direction = require('./Direction');
import SelectionMode = require('./SelectionMode');
import SelectionHelper = require('./SelectionHelper');
import Command = require('./Command/Command');
import CommandHistory = require('./Command/CommandHistory');
import AppendCommand = require('./Command/AppendCommand');
import EnvelopeCommand = require('./Command/EnvelopeCommand');
import RemoveCommand = require('./Command/RemoveCommand');
import ReplaceRootCommand = require('./Command/ReplaceRootCommand');
import RearrangeCommand = require('./Command/RearrangeCommand');


class NestedNodeDocument<D> extends EventEmitter implements NestedNodeRegistry<D>, DocumentActions {

    protected root: NestedNode<D>;

    get data() {
        return this.root.data;
    }

    //internal
    replaceRoot(newRoot: NestedNode<D>): NestedNode<D> {
        var oldRoot = this.root;
        this.root = newRoot;
        return oldRoot;
    }

    // * Abstract Node Data methods

    protected getBlankNodeData(): D {
        throw new Error('abstract method');
    }

    // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
    protected nodeDataDuplicator(data: D): D {
        throw new Error('abstract method');
    }

    private createBlankNode(): NestedNode<D> {
        return new NestedNode(this, this.getBlankNodeData(), this.nodeDataDuplicator);
    }

    // * Node Registry

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    registerNode(node: NestedNode<D>): string {
        //todo check if node not already registred
        var nodeId = this.id + '-' + ++this.nodeRegistryCounter;
        this.nodeRegistry.set(nodeId, node);
        return nodeId;
    }

    unregisterNode(node: NestedNode<D>): void {
        this.nodeRegistry.delete(node.id);
        //todo cleanup previouslyFocusedNested
    }

    getNodeById(id: string): NestedNode<D> {
        return this.nodeRegistry.get(id);
    }


    // * Document Actions

    // ** Actions With Focused Node

    private focusedNode: NestedNode<D>;
    private previouslyFocusedNested: Collection.Map<NestedNode<D>, NestedNode<D>>;
    private currentFocusLevel: number;

    focusNodeById(id: string, selectionMode: SelectionMode): void {
        var node = this.getNodeById(id);
        if (! node) {
            console.warn('No node found with id: ' + id);
            return;
        }
        this.focusNode(node, selectionMode);
    }

    focusParentNode(): void {
        this.focusNode(this.focusedNode.parent, SelectionMode.Reset);
    }

    focusNestedNode(): void {
        var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
        this.focusNode(nested, SelectionMode.Reset);
    }

    focusPrevNode(selectionMode: SelectionMode): void {
        this.focusSiblingNode(Direction.getBackward(), selectionMode);
    }

    focusNextNode(selectionMode: SelectionMode): void {
        this.focusSiblingNode(Direction.getForward(), selectionMode);
    }

    private focusSiblingNode(direction: Direction, selectionMode: SelectionMode): void {

        if ([SelectionMode.Reset, SelectionMode.Shift].indexOf(selectionMode) == -1) {
            throw new Error('Unsupported SelectionMode for this operation :' + selectionMode);
        }
        if (! this.focusedNode.hasParent) {
            return;
        }
        var sibling;
        var sameParentOnly;
        var updateFocusLevel;

        if (selectionMode == SelectionMode.Shift) {
            sibling = this.focusedNode.getSibling(direction, sameParentOnly=true);
            this.focusNode(sibling, SelectionMode.Shift, updateFocusLevel=true);
        } else {
            sibling = this.focusedNode.getSibling(direction, sameParentOnly=false, this.currentFocusLevel);
            this.focusNode(sibling, SelectionMode.Reset, updateFocusLevel=false);
        }
    }

    private focusNode(node: NestedNode<D>, selectionMode: SelectionMode = SelectionMode.Reset, updateFocusLevel = true): void {
        if (! node) {
            return;
        }
        var nodeToFocus = (() => { switch (selectionMode) {
            case SelectionMode.Reset: return SelectionHelper.resetSelectionToNode(node);
            case SelectionMode.Toggle: return SelectionHelper.toggleSelectionWithNode(node);
            case SelectionMode.Shift: return SelectionHelper.shiftSelectionToNode(this.focusedNode, node);
            default: throw new Error('Unknown SelectionMode: ' + selectionMode);
        }})();

        this.setFocusedNode(nodeToFocus, updateFocusLevel);
        this.emit('focusChange', this.focusedNode.id);
    }

    private setFocusedNode(node: NestedNode<D>, updateFocusLevel = true): void {
        this.focusedNode = node;
        if (node.hasParent) {
            this.previouslyFocusedNested.set(node.parent, node);
        }
        if (updateFocusLevel) {
            this.currentFocusLevel = this.focusedNode.level;
        }
    }


    // ** Modification Actions

    private history: CommandHistory;

    insertNewNode(): void {
        this.executeCommand(new AppendCommand([this.createBlankNode()], this.focusedNode));
    }

    appendNewNodeBefore(): void {
        this.appendNewNode(Direction.getBackward());
    }

    appendNewNodeAfter(): void {
        this.appendNewNode(Direction.getForward());
    }

    private appendNewNode(direction: Direction): void {
        var parentNode;
        var anchorNode;
        if (this.focusedNode.hasParent) {
            parentNode = this.focusedNode.parent;
            anchorNode = this.focusedNode;
        } else {
            parentNode = this.focusedNode;
            anchorNode = direction.isForward ? this.focusedNode.lastNested : this.focusedNode.firstNested;
        }
        var cmd = new AppendCommand([this.createBlankNode()], parentNode, anchorNode, direction);
        this.executeCommand(cmd);
    }

    envelopeNode(): void {
        if (! this.focusedNode.hasParent) {
            //todo
            return;
        }
        var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
        this.executeCommand(new EnvelopeCommand(selection, this.createBlankNode()));
    }

    removeNode(): void {
        if (! this.focusedNode.hasParent) {
            // можно было бы просто не давать перевести фокус на root, т.е. скрывать его из view,
            // и тогда бы не потребовались специальные операции над корневым,
            // но пока что хочу, чтобы в интерфейсе root присутствовал явно и был только один;
            // а раз так, то можно не только скрывть root, но и не допускать создания больше одного top-level узла,
            // это выглядит как совсем хак, зато не придется создавать отдельные команды для работы корневым
            this.executeCommand(new ReplaceRootCommand(this, this.createBlankNode()));
            return;
        }
        this.executeCommand(new RemoveCommand(this.root.getSelection()));
    }

    moveNodeForward(): void {
        this.rearrangeNode(Direction.getForward());
    }

    moveNodeBackward(): void {
        this.rearrangeNode(Direction.getBackward());
    }

    private rearrangeNode(direction: Direction): void {
        if (! this.focusedNode.hasParent) {
            return;
        }
        var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
        // вместо сдвига каждого узла в selection,
        // приводим это действие к перестановке через selection соседствующего узла;
        // вообще, это уже внутреннее дело команды, как ей там действовать,
        // и я бы перенес это код туда,
        // но тогда интерфейс команд должен быть дополнен методом canExecute,
        // который бы проверял наличие nodeToRearrange
        var boundaryIndex = direction.isForward ? selection.length - 1 : 0;
        var nodeToRearrange = selection[boundaryIndex].getSibling(direction);
        if (! nodeToRearrange) {
            return;
        }
        this.executeCommand(new RearrangeCommand(nodeToRearrange, selection, direction));
    }

    private executeCommand(cmd: Command) {
        this.root.unselectDeep();
        var nextFocusedNode = cmd.execute();
        this.history.push(cmd);
        this.setFocusedNode(nextFocusedNode);
        this.emit('change', this.data);
    }

    // *** Undo / Redo Actions

    undo(): void {
        this.stepHistory(Direction.getBackward())
    }

    redo(): void {
        this.stepHistory(Direction.getForward());
    }

    private stepHistory(direction: Direction): void {
        if (! this.history.canStepTo(direction)) {
            return;
        }
        this.root.unselectDeep();
        this.setFocusedNode(this.history.stepTo(direction));
        this.emit('change', this.data);
    }


    // * Constructing

    constructor(data: D) {
        super();
        this.id = 'doc'; //todo something
        this.nodeRegistry = new Collection.Map<string, NestedNode<D>>();
        this.history = new CommandHistory();
        this.previouslyFocusedNested = new Collection.Map<NestedNode<D>, NestedNode<D>>();

        this.root = new NestedNode<D>(this, data, this.nodeDataDuplicator);
        this.focusNode(this.root);

        this.addListener('focusChange', () => this.emit('change'));
    }


}


export = NestedNodeDocument;
