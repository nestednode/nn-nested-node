import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import SelectionMode = require('./SelectionMode');
declare class NestedNodeDocument<D> extends EventEmitter implements NestedNodeRegistry<D>, DocumentActions {
    protected root: NestedNode<D>;
    data: D;
    replaceRoot(newRoot: NestedNode<D>): NestedNode<D>;
    protected getBlankNodeData(): D;
    protected nodeDataDuplicator(data: D): D;
    private createBlankNode();
    private id;
    private nodeRegistry;
    private nodeRegistryCounter;
    registerNode(node: NestedNode<D>): string;
    unregisterNode(node: NestedNode<D>): void;
    getNodeById(id: string): NestedNode<D>;
    private focusedNode;
    private previouslyFocusedNested;
    private currentFocusLevel;
    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;
    private focusSiblingNode(direction, selectionMode);
    private focusNode(node, selectionMode?, updateFocusLevel?);
    private setFocusedNode(node, updateFocusLevel?);
    private history;
    insertNewNode(): void;
    appendNewNodeBefore(): void;
    appendNewNodeAfter(): void;
    private appendNewNode(direction);
    envelopeNode(): void;
    removeNode(): void;
    moveNodeForward(): void;
    moveNodeBackward(): void;
    private rearrangeNode(direction);
    private executeCommand(cmd);
    undo(): void;
    redo(): void;
    private stepHistory(direction);
    constructor(data: D);
}
export = NestedNodeDocument;
