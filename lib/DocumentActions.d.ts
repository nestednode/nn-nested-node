import SelectionMode = require('./SelectionMode');
interface DocumentActions {
    focusNodeById(id: string, selectionMode: SelectionMode): void;
    focusParentNode(): void;
    focusNestedNode(): void;
    focusPrevNode(selectionMode: SelectionMode): void;
    focusNextNode(selectionMode: SelectionMode): void;
}
export = DocumentActions;
