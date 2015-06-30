import Collection = require('pkg/Collection/Collection');
import EventEmitter = require('pkg/EventEmitter/EventEmitter');

import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import NNDocumentProps = require('../NestedNodeProps/NNDocumentProps');
import NNDocumentActions = require('../NestedNodeProps/NNDocumentActions');
import SelectionMode = require('../NestedNodeProps/SelectionMode');

import NestedNode = require('./NestedNode');
import DataFunctions = require('./DataFunctions');
import ObjectRegistry = require('./ObjectRegistry');
import Direction = require('./Direction');
import SelectionHelper = require('./SelectionHelper');
import ClipboardProvider = require('./ClipboardProvider');

import CommandHistory = require('./CommandHistory');
import Command = require('./Command/Command');
import UpdateDataCommand = require('./Command/UpdateDataCommand');
import AppendCommand = require('./Command/AppendCommand');
import EnvelopeCommand = require('./Command/EnvelopeCommand');
import DuplicateCommand = require('./Command/DuplicateCommand');
import RemoveCommand = require('./Command/RemoveCommand');
import RearrangeCommand = require('./Command/RearrangeCommand');
import CompositeCommand = require('./Command/CompositeCommand');


class NNDocument<D>
    extends EventEmitter
    implements ObjectRegistry<NestedNode<D>>, NNDocumentProps<D>, NNDocumentActions<D> {

    // root - это прокси-узел, удобен для того,
    // чтобы исключить передачу в команды parentless-узлов
    protected root: NestedNode<any>;

    // фактический узел документа, таким образом, не root, а его первый (и единственный) nested
    get node(): NestedNodeProps<D> {
        return this.root.firstNested;
    }


    // * Node Data functions
    protected dataFunctions: DataFunctions<D>;


    private createNode(props?: NestedNodeProps<D>): NestedNode<D> {
        props = props || { data: this.dataFunctions.getBlank() };
        return new NestedNode<D>(this, props, this.dataFunctions.duplicate);
    }

    private isBlankNode(node: NestedNode<D>): boolean {
        if (node.nestedCount != 0) {
            return false;
        }
        return this.dataFunctions.isBlank(node.data);
    }


    // * Node Registry

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    registerItem(node: NestedNode<D>): string {
        //todo check if node not already registred
        var nodeId = this.id + '-' + this.nodeRegistryCounter++;
        this.nodeRegistry.set(nodeId, node);
        return nodeId;
    }

    unregisterItem(node: NestedNode<D>): void {
        this.nodeRegistry.delete(node.id);
        //todo cleanup previouslyFocusedMap
    }

    getItemById(id: string): NestedNode<D> {
        return this.nodeRegistry.get(id);
    }


    // * Document Actions

    // ** Actions With Focused Node

    protected focusedNode: NestedNode<D>;
    private previouslyFocusedMap: Collection.Map<NestedNode<D>, NestedNode<D>>;
    private currentFocusLevel: number;

    focusNodeById(id: string, selectionMode: SelectionMode): void {
        var node = this.getItemById(id);
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

    selectNodeSiblings(): void {
        this.setFocusedNode(SelectionHelper.extendSelectionToNodeSiblings(this.focusedNode));
        this.emit('focusChange', this.focusedNode.id);
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
        this.focusedNode && this.focusedNode.unfocus();
        this.focusedNode = node.focus();
        this.previouslyFocusedMap.set(node.parent, node);
        if (updateFocusLevel) {
            this.currentFocusLevel = this.focusedNode.level;
        }
    }


    // ** Data Edit Actions

    private _editMode: boolean;

    get editMode(): boolean {
        return !! this._editMode;
    }

    private nodeDataSnapshot: D;

    enterEditMode(clearCurrentValue = false, emitModeChange = true): void {
        if (this._editMode) {
            console.warn('already in edit mode');
            return;
        }
        this._editMode = true;
        SelectionHelper.resetSelectionToNode(this.focusedNode);
        this.nodeDataSnapshot = this.dataFunctions.duplicate(this.focusedNode.data);
        if (clearCurrentValue) {
            this.focusedNode.data = this.dataFunctions.getBlank();
        }
        emitModeChange && this.emit('change', this);
    }

    updateNodeData(newData: D): void {
        if (this._editMode) {
            this.focusedNode.data = newData;
            this.emit('change', this);
        } else {
            var emitModeChange, clearCurrentValue, undoChanges;
            this.enterEditMode(clearCurrentValue=false, emitModeChange=false);
            this.focusedNode.data = newData;
            this.exitEditMode(undoChanges=false, emitModeChange=false)
        }
    }

    exitEditMode(undoChanges = false, emitModeChange = true): void {
        if (! this._editMode) {
            console.warn('already in normal mode');
            return;
        }
        this._editMode = false;
        var dataEqual = this.dataFunctions.isEqual(this.nodeDataSnapshot, this.focusedNode.data);
        if (dataEqual) {
            // все равно возвращаем узлу исходные данные
            // т.к. equalityChecker может не учитывать whitespace при сравнении
            this.focusedNode.data = this.nodeDataSnapshot;
            emitModeChange && this.emit('change', this);
            return;
        }
        var command = new UpdateDataCommand(this.focusedNode, this.nodeDataSnapshot, this.focusedNode.data);
        if (undoChanges) {
            var emitChange;
            this.executeCommand(command, emitChange=false);
            this.undo();
        } else {
            this.executeCommand(command);
        }
    }


    // ** Structure Modification Actions

    insertNewNode(): void {
        this.executeCommand(new AppendCommand([this.createNode()], this.focusedNode));
    }

    appendNewNodeBefore(): void {
        this.appendNewNode(Direction.getBackward());
    }

    appendNewNodeAfter(): void {
        this.appendNewNode(Direction.getForward());
    }

    private appendNewNode(direction: Direction): void {
        var parentNode;
        var command: Command;
        var nodesToAppend = [this.createNode()];

        if (this.focusedNode.isTopLevel) {
            // topLevel-узел может быть только один, поэтому добавляем внутрь него, а не рядом
            parentNode = this.focusedNode;
            var aheadNode = direction.isBackward ? this.focusedNode.firstNested : null;
            command = new AppendCommand(nodesToAppend, parentNode, aheadNode);
        } else {
            parentNode = this.focusedNode.parent;
            var anchorNode = this.focusedNode;
            command = new AppendCommand(nodesToAppend, parentNode, anchorNode, direction);
        }
        this.executeCommand(command);
    }

    envelopeNode(): void {
        var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
        this.executeCommand(new EnvelopeCommand(selection, this.createNode()));
    }

    duplicateNode(): void {
        if (this.focusedNode.isTopLevel) {
            return;
        }
        var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
        var duplicatedNodes = selection.map(node => this.createNode(node));
        this.executeCommand(new DuplicateCommand(selection, duplicatedNodes));
    }

    removeNode(): void {
        var command;
        var removeCommand = new RemoveCommand(this.root.getSelection());

        if (this.focusedNode.isTopLevel) {
            // нельзя остаться вообще без topLevel-узла, поэтому просто заменяем его пустым
            if (this.isBlankNode(this.focusedNode)) {
                //но если узел и так уже blank, не засоряем history лишними операциями
                return;
            }
            command = new CompositeCommand([
                removeCommand,
                new AppendCommand([this.createNode()], this.root)
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

    //private clipboard: ClipboardProvider<NestedNodeProps<D>[]>; // слишком сложно для моей ide
    private clipboard: ClipboardProvider<NestedNodeProps<any>[]>;

    copyToClipboard(): void {
        var nodesProps = this.root.getSelection().map(node => node.cloneProps(this.dataFunctions.duplicate));
        this.clipboard.set(nodesProps);
    }

    cutToClipboard(): void {
        this.copyToClipboard();
        this.removeNode();
    }

    pasteFromClipboard(): void {
        var nodesProps = this.clipboard.get();
        if (! nodesProps) {
            return;
        }
        var nodesToPaste = nodesProps.map(props => this.createNode(props));
        var command;
        var parentNode;

        if (this.isBlankNode(this.focusedNode)) {
            // при вставке в пустой узел, просто заменяем его содержимым
            parentNode = this.focusedNode.parent;
            var aheadNode = this.focusedNode.getSibling();
            command = new CompositeCommand([
                new RemoveCommand([this.focusedNode]),
                new AppendCommand(nodesToPaste, parentNode, aheadNode)
            ]);
        } else {
            parentNode = this.focusedNode;
            command = new AppendCommand(nodesToPaste, parentNode);
        }
        this.executeCommand(command);
    }


    // ** Undo / Redo Actions

    private history: CommandHistory;

    private executeCommand(cmd: Command, emitChange = true) {
        this.root.unselectDeep();
        var nextFocusedNode = cmd.execute();
        this.history.push(cmd);
        this.setFocusedNode(nextFocusedNode);
        emitChange && this.emit('change', this);
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
        this.emit('change', this);
    }


    // * Constructing

    constructor(
        content: NestedNodeProps<D>,
        dataFunctions: DataFunctions<D>,
        clipboardProvider?: ClipboardProvider<NestedNodeProps<D>[]>
    ) {
        super();

        this.id = 'doc'; //todo something
        this.dataFunctions = dataFunctions;
        this.nodeRegistry = new Collection.Map<string, NestedNode<D>>();
        this.history = new CommandHistory();
        this.previouslyFocusedMap = new Collection.Map<NestedNode<D>, NestedNode<D>>();

        this.root = new NestedNode<{}>(this, { data: null }, d => d);
        var topNode = this.createNode(content).appendToParent(this.root).select();
        this.setFocusedNode(topNode);

        //this._editMode = false;

        this.clipboard = clipboardProvider || new LocalClipboardProvider();

        this.addListener('focusChange', () => this.emit('change', this));
    }

}


class LocalClipboardProvider implements ClipboardProvider<any> {

    private clipboardContent;

    get() { return this.clipboardContent; }

    set(content) {this.clipboardContent = content }

}


export = NNDocument;
