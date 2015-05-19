import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import NodeRelation = require('./NodeRelation');
import Direction = require('./Direction');
declare class NestedNodeDocument<D> implements NestedNodeRegistry<D>, DocumentActions {
    root: NestedNode<D>;
    private id;
    private nodeRegistry;
    private nodeRegistryCounter;
    focusedNode: NestedNode<D>;
    previouslyFocusedNested: Collection.Map<NestedNode<D>, NestedNode<D>>;
    currentFocusLevel: number;
    constructor();
    registerNode(node: NestedNode<D>): string;
    unregisterNode(node: NestedNode<D>): void;
    getNodeById(id: string): NestedNode<D>;
    focusNodeById(id: string, extendSelection?: boolean): void;
    focusRelatedNode(targetNodeRelation: NodeRelation, extendSelection?: boolean): void;
    protected focusNode(node: NestedNode<D>, extendSelection?: boolean): void;
    protected focusNestedNode(): void;
    protected focusParentNode(): void;
    protected focusSiblingNode(direction: Direction, extendSelection: any): void;
    private makeNodeFocused(node?);
}
export = NestedNodeDocument;
