import Collection = require('pkg/Collection/Collection');
import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import Direction = require('./Direction');
import SelectionMode = require('./SelectionMode');
import SelectionHelper = require('./SelectionHelper');
import ClipboardProvider = require('./ClipboardProvider');

import CommandHistory = require('./Command/CommandHistory');
import Command = require('./Command/Command');
import AppendCommand = require('./Command/AppendCommand');
import EnvelopeCommand = require('./Command/EnvelopeCommand');
import RemoveCommand = require('./Command/RemoveCommand');
import RearrangeCommand = require('./Command/RearrangeCommand');
import CompositeCommand = require('./Command/CompositeCommand');
import PreserveFocusCommand = require('./Command/PreserveFocusCommand');


class NestedNodeDocument<D> extends EventEmitter implements NestedNodeRegistry<D>, DocumentActions {

    // root - это прокси-узел, удобен для того,
    // чтобы исключить передачу в команды parentless-узлов
    protected root: NestedNode<any>;

    // фактический узел документа, таким образом, не root, а его первый (и единственный) nested
    get data(): D {
        return this.root.firstNested.data;
    }

    // * Abstract Node Data methods

    protected getBlankNodeData(): D {
        throw new Error('abstract method');
    }

    // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
    protected nodeFieldDuplicator(data: D): D {
        throw new Error('abstract method');
    }

    private createBlankNode(): NestedNode<D> {
        return new NestedNode(this, this.getBlankNodeData(), this.nodeFieldDuplicator);
    }

    // * Node Registry

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    registerNode(node: NestedNode<D>): string {
        //todo check if node not already registred
        var nodeId = this.id + '-' + this.nodeRegistryCounter++;
        this.nodeRegistry.set(nodeId, node);
        return nodeId;
    }

    unregisterNode(node: NestedNode<D>): void {
        this.nodeRegistry.delete(node.id);
        //todo cleanup previouslyFocusedMap
    }

    getNodeById(id: string): NestedNode<D> {
        return this.nodeRegistry.get(id);
    }


    // * Document Actions

    // ** Actions With Focused Node

    private focusedNode: NestedNode<D>;
    private previouslyFocusedMap: Collection.Map<NestedNode<D>, NestedNode<D>>;
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
        if (this.focusedNode.isTopLevel) {
            return;
        }
        this.focusNode(this.focusedNode.parent, SelectionMode.Reset);
    }

    focusNestedNode(): void {
        var nested = this.getPreviouslyFocusedNested(this.focusedNode) || this.focusedNode.firstNested;
        this.focusNode(nested, SelectionMode.Reset);
    }

    private getPreviouslyFocusedNested(parentNode: NestedNode<D>): NestedNode<D> {
        var nestedNode = this.previouslyFocusedMap.get(parentNode);
        if (nestedNode && (!nestedNode.hasParent || nestedNode.parent !== parentNode)) {
            // неактуальное значение в кеше, удаляем его
            this.previouslyFocusedMap.delete(parentNode);
            return null;
        }
        return nestedNode;
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
        if (! node.hasParent) {
            throw new Error('parentless node not allowed to be focused');
        }
        this.focusedNode = node;
        this.previouslyFocusedMap.set(node.parent, node);
        if (updateFocusLevel) {
            this.currentFocusLevel = this.focusedNode.level;
        }
    }


    // ** Modification Actions

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
        var command: Command;
        var nodesToAppend = [this.createBlankNode()];

        if (this.focusedNode.isTopLevel) {
            // topLevel-узел может быть только один, поэтому добавляем внутрь него, а не рядом
            parentNode = this.focusedNode;
            anchorNode = direction.isForward ? this.focusedNode.lastNested : this.focusedNode.firstNested;
            command = new CompositeCommand([
                new PreserveFocusCommand(this.focusedNode), // при undo фокус гарантированно вернется к topLevel
                new AppendCommand(nodesToAppend, parentNode, anchorNode, direction)
            ]);
        } else {
            parentNode = this.focusedNode.parent;
            anchorNode = this.focusedNode;
            command = new AppendCommand(nodesToAppend, parentNode, anchorNode, direction);
        }
        this.executeCommand(command);
    }

    envelopeNode(): void {
        var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
        this.executeCommand(new EnvelopeCommand(selection, this.createBlankNode()));
    }

    removeNode(): void {
        var command;
        var removeCommand = new RemoveCommand(this.root.getSelection());

        if (this.focusedNode.isTopLevel) {
            // нельзя остаться вообще без topLevel-узла, поэтому сразу создаем на его месте новый
            //todo если узел и так уже blank (т.е. data = blankNodeData), не засорять history пустыми удалениями
            command = new CompositeCommand([
                removeCommand,
                new AppendCommand([this.createBlankNode()], this.root)
            ]);
        } else {
            command = removeCommand;
        }
        this.executeCommand(command);
    }

    moveNodeForward(): void {
        this.rearrangeNode(Direction.getForward());
    }

    moveNodeBackward(): void {
        this.rearrangeNode(Direction.getBackward());
    }

    private rearrangeNode(direction: Direction): void {
        var nodesToRearrange = SelectionHelper.getSelectionNearNode(this.focusedNode);
        if (! RearrangeCommand.canExecute(nodesToRearrange, direction)) {
            return;
        }
        this.executeCommand(new RearrangeCommand(nodesToRearrange, direction));
    }

    // *** Copy / Paste Actions

    private clipboard: ClipboardProvider<D[]>;

    copyToClipboard(): void {
        var data = this.root.getSelection().map(node => node.cloneData(this.nodeFieldDuplicator));
        this.clipboard.set(data);
    }

    cutToClipboard(): void {
        this.copyToClipboard();
        this.removeNode();
    }

    pasteFromClipboard(): void {
        var data = this.clipboard.get();
        if (! data) {
            return;
        }
        // todo createNode() factory
        var nodesToPaste = data.map(d => new NestedNode(this, d, this.nodeFieldDuplicator));
        // todo
        this.executeCommand(new AppendCommand(nodesToPaste, this.focusedNode));
    }

    // *** Undo / Redo Actions

    private history: CommandHistory;

    private executeCommand(cmd: Command) {
        this.root.unselectDeep();
        var nextFocusedNode = cmd.execute();
        this.history.push(cmd);
        this.setFocusedNode(nextFocusedNode);
        this.emit('change', this.data);
    }

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
        var nodeToFocus = this.history.stepTo(direction);
        this.setFocusedNode(nodeToFocus);
        this.emit('change', this.data);
    }


    // * Constructing

    constructor(data: D, clipboardProvider?: ClipboardProvider<D[]>) {
        super();

        this.id = 'doc'; //todo something
        this.nodeRegistry = new Collection.Map<string, NestedNode<D>>();
        this.history = new CommandHistory();
        this.previouslyFocusedMap = new Collection.Map<NestedNode<D>, NestedNode<D>>();

        this.root = new NestedNode<any>(this, {}, d => d);
        var topNode = new NestedNode<D>(this, data, this.nodeFieldDuplicator);
        this.setFocusedNode(topNode.appendToParent(this.root).select());

        this.clipboard = clipboardProvider || new LocalClipboardProvider<D[]>();

        this.addListener('focusChange', () => this.emit('change'));
    }

}


class LocalClipboardProvider<T> implements ClipboardProvider<T> {

    private clipboardData: T;

    get(): T { return this.clipboardData; }

    set(data: T) {this.clipboardData = data }

}


export = NestedNodeDocument;
