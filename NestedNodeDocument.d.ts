import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./lib/NestedNode');
import Direction = require('./lib/Direction');
declare class NestedNodeDocument {
    root: NestedNode;
    focusedNode: NestedNode;
    previouslyFocusedNested: Collection.Map<NestedNode, NestedNode>;
    currentFocusLevel: number;
    focusNode(node: NestedNode, extendSelection?: boolean): void;
    focusNestedNode(): void;
    focusParentNode(): void;
    focusSiblingNode(direction: Direction, extendSelection?: boolean): void;
    private resetFocusedNode(node?);
}
export = NestedNodeDocument;
