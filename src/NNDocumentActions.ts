import SelectionMode = require('./SelectionMode');


interface NNDocumentActions<D> {

    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;

    enterEditMode(clearCurrentValue?: boolean): void;
    updateNodeData(newData: D): void;
    exitEditMode(undoChanges?: boolean): void;

    // не совсем точны названия, многие действия могут манипулировать и множеством узлов
    // можно заменить node на selected, или вообще убрать node, но тогда
    // нужно завернуть это к какой-нибудь action. namespace,
    // иначе совсем не очевидно, что делает, например, document.remove()
    // или оставить как есть
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


export = NNDocumentActions;
