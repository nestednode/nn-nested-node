import NestedNode = require('./NestedNode');
interface NestedNodeRegistry {
    register(node: NestedNode): string;
    unregister(node: NestedNode): any;
    getNodeById(id: string): NestedNode;
}
export = NestedNodeRegistry;
