import SelectionMode = require('./SelectionMode');
interface NNDocumentActions<D> {
    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;
    selectNodeSiblings(): void;
    enterEditMode(newData?: D): void;
    updateNodeData(newData: D): void;
    exitEditMode(undoChanges?: boolean): void;
    insertNewNode(): void;
    appendNewNodeBefore(): void;
    appendNewNodeAfter(): void;
    duplicateNode(): void;
    envelopeNode(): void;
    removeNode(): void;
    moveNodeForward(): void;
    moveNodeBackward(): void;
    copyToClipboard(): void;
    cutToClipboard(): void;
    pasteFromClipboard(): void;
    undo(): void;
    redo(): void;
}
export = NNDocumentActions;
