import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import Direction = require('./Direction');
import ObjectRegistry = require('./ObjectRegistry');
declare class NestedNode<D> implements NestedNodeProps<D> {
    private _id;
    id: string;
    private _parent;
    parent: NestedNode<D>;
    hasParent: boolean;
    root: NestedNode<D>;
    level: number;
    isTopLevel: boolean;
    nested: NestedNode<D>[];
    firstNested: NestedNode<D>;
    lastNested: NestedNode<D>;
    nestedCount: number;
    forEachNestedDeep(cb: (node: NestedNode<D>) => void): void;
    traverse(cb: (node: NestedNode<D>) => void): void;
    getSibling(direction?: Direction, sameParentOnly?: boolean, preferredLevel?: number): NestedNode<D>;
    getDirectionToSibling(node: NestedNode<D>): Direction;
    private getImmediateSibling(direction);
    private getCrossSibling(direction, preferredLevel);
    private getCrossSiblingPhase2(direction, preferredLevel);
    appendNested(node: NestedNode<D>, aheadNode?: NestedNode<D>): NestedNode<D>;
    removeNested(node: NestedNode<D>): NestedNode<D>;
    appendToParent(parent: NestedNode<D>, aheadNode?: NestedNode<D>): NestedNode<D>;
    removeFormParent(): NestedNode<D>;
    arrangeBefore(node: NestedNode<D>): NestedNode<D>;
    private _selected;
    selected: boolean;
    select(): NestedNode<D>;
    unselect(): NestedNode<D>;
    unselectDeep(): NestedNode<D>;
    getSelection(): NestedNode<D>[];
    _focused: boolean;
    focused: boolean;
    focus(): NestedNode<D>;
    unfocus(): NestedNode<D>;
    data: D;
    cloneProps(dataDuplicator: (src: D) => D): NestedNodeProps<D>;
    constructor(registry: ObjectRegistry<any>, props: NestedNodeProps<D>, dataDuplicator: (src: D) => D);
}
declare module NestedNode {
    interface AnyNestedNode extends NestedNode<any> {
    }
}
export = NestedNode;
