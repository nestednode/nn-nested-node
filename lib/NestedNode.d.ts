import Direction = require('./Direction');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import NestedNodeData = require('./NestedNodeData');
declare class NestedNode implements NestedNodeData {
    private registry;
    private _id;
    id: string;
    private _parent;
    parent: NestedNode;
    hasParent: boolean;
    root: NestedNode;
    level: number;
    private _nested;
    nested(index: number): NestedNode;
    firstNested: NestedNode;
    lastNested: NestedNode;
    nestedCount: number;
    forEach(cb: (node: NestedNode) => void, thisArg?: any): void;
    forEachDeep(cb: (node: NestedNode) => void): void;
    traverse(cb: (node: NestedNode) => void): void;
    getSibling(direction: Direction, sameParentOnly?: boolean, preferredLevel?: number): NestedNode;
    private getImmediateSibling(direction);
    private getCrossSibling(direction, preferredLevel);
    private getCrossSiblingPhase2(direction, preferredLevel);
    appendNested(node: NestedNode, anchorNode?: NestedNode, direction?: Direction): void;
    removeNested(node: NestedNode): void;
    replaceNested(node: NestedNode, newNode: NestedNode): void;
    attachToParent(parent: NestedNode): void;
    makeParentless(): void;
    substituteFor(newNode: NestedNode): void;
    private _selected;
    selected: boolean;
    select(ensureNestedUnselected?: boolean): void;
    unselect(): void;
    unselectDeep(): void;
    getSelection(): NestedNode[];
    constructor(registry: NestedNodeRegistry, ref?: NestedNode);
    protected init(): void;
    protected clone(ref: NestedNode): void;
    getCopy(): NestedNode;
}
export = NestedNode;
