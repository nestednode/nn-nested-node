import NestedNode = require('./NestedNode');
interface NestedNodeRegistry<D> {
    registerNode(node: NestedNode<D>, suggestedId?: string): string;
    unregisterNode(node: NestedNode<D>): void;
    getNodeById(id: string): NestedNode<D>;
}
export = NestedNodeRegistry;
