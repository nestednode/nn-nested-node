import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./NestedNode');


interface NestedNodeRegistry {

    //objRegistry: Collection.Map<string, NestedNode>;

    register(node: NestedNode): string;

    unregister(node: NestedNode);

    getNodeById(id: string): NestedNode;
}


export = NestedNodeRegistry;
