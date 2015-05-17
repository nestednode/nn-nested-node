import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import NodeRelation = require('./NodeRelation');
import Direction = require('./Direction');
declare class NestedNodeDocument implements NestedNodeRegistry, DocumentActions {
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
    focusNodeById(id: string, extendSelection?: boolean): void;
    focusRelatedNode(targetNodeRelation: NodeRelation, extendSelection?: boolean): void;
    protected focusNode(node: NestedNode, extendSelection: any): void;
    protected focusNestedNode(): void;
    protected focusParentNode(): void;
    protected focusSiblingNode(direction: Direction, extendSelection: any): void;
    private makeNodeFocused(node?);
}
export = NestedNodeDocument;
