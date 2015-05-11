import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./lib/NestedNode');
import NestedNodeRegistry = require('./lib/NestedNodeRegistry');
import Direction = require('./lib/Direction');
declare class NestedNodeDocument implements NestedNodeRegistry {
    root: NestedNode;
    private id;
    private nodeRegistry;
    private nodeRegistryCounter;
    focusedNode: NestedNode;
    previouslyFocusedNested: Collection.Map<NestedNode, NestedNode>;
    currentFocusLevel: number;
    registerNode(node: NestedNode): string;
    unregisterNode(node: NestedNode): void;
    getNodeById(id: string): NestedNode;
    focusNode(node: NestedNode, extendSelection?: boolean): void;
    focusNestedNode(): void;
    focusParentNode(): void;
    focusSiblingNode(direction: Direction, extendSelection?: boolean): void;
    private makeNodeFocused(node?);
}
export = NestedNodeDocument;
