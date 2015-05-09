import NestedNode = require('./lib/NestedNode');
declare class NestedNodeDocument {
    root: NestedNode;
    focusedNode: NestedNode;
    previouslyFocusedNested: Map<NestedNode, NestedNode>;
    currentFocusLevel: number;
    focusNode(node: NestedNode, extendSelection?: boolean): void;
    focusNestedNode(): void;
    focusParentNode(): void;
    focusPrecedingNode(extendSelection?: boolean): void;
    focusFollowingNode(extendSelection?: boolean): void;
    private focusSiblingNode(node, extendSelection);
    private resetFocusedNode(node?);
}
export = NestedNodeDocument;
