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
import RemoveCommand = require('./Command/RemoveCommand');


class NestedNodeDocument<D> extends EventEmitter implements NestedNodeRegistry<D>, DocumentActions {

    protected root: NestedNode<D>;
    get content() {
        return this.root.data;
    }

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    private history: CommandHistory;

    focusedNode: NestedNode<D>;
    previouslyFocusedNested: Collection.Map<NestedNode<D>, NestedNode<D>>;
    currentFocusLevel: number;

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


    // * Abstract Node Data methods

    protected getBlankNodeData(): D {
        throw new Error('abstract method');
    }

    // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
    protected nodeDataDuplicator(data: D): D {
        throw new Error('abstract method');
    }


    // * Node Registry

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

    protected focusSiblingNode(direction: Direction, selectionMode: SelectionMode): void {

        if ([SelectionMode.Reset, SelectionMode.Shift].indexOf(selectionMode) == -1) {
            throw new Error('Unsupported SelectionMode for this operation :' + selectionMode);
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

    protected focusNode(node: NestedNode<D>, selectionMode: SelectionMode = SelectionMode.Reset, updateFocusLevel = true): void {
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

    insertNewNode(): void {
        var newNode = new NestedNode(this, this.getBlankNodeData(), this.nodeDataDuplicator);
        this.executeCommand(new AppendCommand([newNode], this.focusedNode));
    }

    removeNode(): void {
        this.executeCommand(new RemoveCommand(this.root.getSelection()));
    }

    private executeCommand(cmd: Command) {
        this.root.unselectDeep();
        var nextFocusedNode = cmd.execute();
        this.history.push(cmd);
        this.setFocusedNode(nextFocusedNode);
        this.emit('change', this.content);
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
        this.emit('change', this.content);
    }

}


export = NestedNodeDocument;
