import NestedNode = require('./NestedNode');
interface NestedNodeRegistry {
    registerNode(node: NestedNode): string;
    unregisterNode(node: NestedNode): void;
    getNodeById(id: string): NestedNode;
}
export = NestedNodeRegistry;
