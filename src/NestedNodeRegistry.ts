import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./NestedNode');


//todo зачем тут вообще NestedNode?
// пуст это будет ObjectRegistry<T>
// а node заменить на item, например
interface NestedNodeRegistry<D> {

    registerNode(node: NestedNode<D>, suggestedId?: string): string;

    unregisterNode(node: NestedNode<D>): void;

    getNodeById(id: string): NestedNode<D>;
}


export = NestedNodeRegistry;
