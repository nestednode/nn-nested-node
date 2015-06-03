import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNode = require('./NestedNode');
import NestedNodeProps = require('./NestedNodeProps');
import ObjectRegistry = require('./ObjectRegistry');
import NNDocumentProps = require('./NNDocumentProps');
import NNDocumentActions = require('./NNDocumentActions');
import SelectionMode = require('./SelectionMode');
import ClipboardProvider = require('./ClipboardProvider');
declare class NNDocument<D> extends EventEmitter implements ObjectRegistry<NestedNode<D>>, NNDocumentProps<D>, NNDocumentActions<D> {
    protected root: NestedNode<any>;
    node: NestedNodeProps<D>;
    protected getBlankNodeData(): D;
    protected nodeDataDuplicator(data: D): D;
    protected nodeDataEqualityChecker(data1: D, data2: D): boolean;
    private createNode(props?);
    private isBlankNode(node);
    private id;
    private nodeRegistry;
    private nodeRegistryCounter;
    registerItem(node: NestedNode<D>): string;
    unregisterItem(node: NestedNode<D>): void;
    getItemById(id: string): NestedNode<D>;
    protected focusedNode: NestedNode<D>;
    private previouslyFocusedMap;
    private currentFocusLevel;
    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    private getPreviouslyFocusedNested(parentNode);
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;
    private focusSiblingNode(direction, selectionMode);
    private focusNode(node, selectionMode?, updateFocusLevel?);
    private setFocusedNode(node, updateFocusLevel?);
    private _editMode;
    editMode: boolean;
    private nodeDataSnapshot;
    enterEditMode(clearCurrentValue?: boolean, emitModeChange?: boolean): void;
    updateNodeData(newData: D): void;
    exitEditMode(emitModeChange?: boolean): void;
    insertNewNode(): void;
    appendNewNodeBefore(): void;
    appendNewNodeAfter(): void;
    private appendNewNode(direction);
    envelopeNode(): void;
    removeNode(): void;
    moveNodeForward(): void;
    moveNodeBackward(): void;
    private rearrangeNode(direction);
    private clipboard;
    copyToClipboard(): void;
    cutToClipboard(): void;
    pasteFromClipboard(): void;
    private history;
    private executeCommand(cmd);
    undo(): void;
    redo(): void;
    private stepHistory(direction);
    constructor(content: NestedNodeProps<D>, clipboardProvider?: ClipboardProvider<NestedNodeProps<D>[]>);
}
export = NNDocument;
