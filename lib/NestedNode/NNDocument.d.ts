import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import NNDocumentProps = require('../NestedNodeProps/NNDocumentProps');
import NNDocumentActions = require('../NestedNodeProps/NNDocumentActions');
import SelectionMode = require('../NestedNodeProps/SelectionMode');
import NestedNode = require('./NestedNode');
import DataFunctions = require('./DataFunctions');
import ObjectRegistry = require('./ObjectRegistry');
import ClipboardProvider = require('./ClipboardProvider');
declare class NNDocument<D> extends EventEmitter implements ObjectRegistry<NestedNode<D>>, NNDocumentProps<D>, NNDocumentActions<D> {
    private root;
    content: NestedNodeProps<D>;
    private dataFunctions;
    private createNode(props?);
    private isBlankNode(node);
    private nodeRegistry;
    private nodeRegistryCounter;
    registerItem(node: NestedNode<D>): string;
    unregisterItem(node: NestedNode<D>): void;
    getItemById(id: string): NestedNode<D>;
    private focusedNode;
    private previouslyFocusedMap;
    private currentFocusLevel;
    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    private getPreviouslyFocusedNested(parentNode);
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;
    selectNodeSiblings(): void;
    private focusSiblingNode(direction, selectionMode);
    private focusNode(node, selectionMode?, updateFocusLevel?);
    private setFocusedNode(node, updateFocusLevel?);
    private _editMode;
    editMode: boolean;
    private nodeDataSnapshot;
    enterEditMode(clearCurrentValue?: boolean, emitModeChange?: boolean): void;
    updateNodeData(newData: D): void;
    exitEditMode(undoChanges?: boolean, emitModeChange?: boolean): void;
    insertNewNode(): void;
    appendNewNodeBefore(): void;
    appendNewNodeAfter(): void;
    private appendNewNode(direction);
    envelopeNode(): void;
    duplicateNode(): void;
    removeNode(): void;
    moveNodeForward(): void;
    moveNodeBackward(): void;
    private rearrangeNode(direction);
    private clipboard;
    copyToClipboard(): void;
    cutToClipboard(): void;
    pasteFromClipboard(): void;
    private history;
    private executeCommand(cmd, emitChange?);
    undo(): void;
    redo(): void;
    private stepHistory(direction);
    constructor(content: NestedNodeProps<D>, dataFunctions: DataFunctions<D>, clipboardProvider?: ClipboardProvider<NestedNodeProps<D>[]>);
}
export = NNDocument;
