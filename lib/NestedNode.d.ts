import Direction = require('./Direction');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import NestedData = require('./NestedData');
declare class NestedNode<D extends NestedData<{}>> {
    private _id;
    id: string;
    private _parent;
    parent: NestedNode<D>;
    hasParent: boolean;
    root: NestedNode<D>;
    level: number;
    private _nested;
    nested(index: number): NestedNode<D>;
    firstNested: NestedNode<D>;
    lastNested: NestedNode<D>;
    nestedCount: number;
    mapNested<T>(cb: (node: NestedNode<D>) => T, thisArg?: any): T[];
    forEachNested(cb: (node: NestedNode<D>) => void, thisArg?: any): void;
    forEachNestedDeep(cb: (node: NestedNode<D>) => void): void;
    traverse(cb: (node: NestedNode<D>) => void): void;
    getSibling(direction?: Direction, sameParentOnly?: boolean, preferredLevel?: number): NestedNode<D>;
    getDirectionToSibling(node: NestedNode<D>): Direction;
    private getImmediateSibling(direction);
    private getCrossSibling(direction, preferredLevel);
    private getCrossSiblingPhase2(direction, preferredLevel);
    data: D;
    forEachNestedData(cb: (data: D, key) => void, thisArg?: any): void;
    mapNestedData<T>(cb: (data: D, key) => T, thisArg?: any): T[];
    appendNested(node: NestedNode<D>, nodeBefore?: NestedNode<D>): NestedNode<D>;
    removeNested(node: NestedNode<D>): NestedNode<D>;
    replaceNested(node: NestedNode<D>, newNode: NestedNode<D>): void;
    attachToParent(parent: NestedNode<D>): NestedNode<D>;
    makeParentless(): NestedNode<D>;
    substituteFor(newNode: NestedNode<D>): void;
    private _selected;
    selected: boolean;
    select(): NestedNode<D>;
    unselect(): NestedNode<D>;
    unselectDeep(): NestedNode<D>;
    getSelection(): NestedNode<D>[];
    constructor(registry: NestedNodeRegistry<any>, data: D, dataDuplicator: (src: D) => D);
}
declare module NestedNode {
    interface AnyNestedNode extends NestedNode<any> {
    }
}
export = NestedNode;
