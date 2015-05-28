import SelectionMode = require('./SelectionMode');


interface DocumentActions {

    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;

    insertNewNode(): void;
    appendNewNodeBefore(): void;
    appendNewNodeAfter(): void;
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


export = DocumentActions;
