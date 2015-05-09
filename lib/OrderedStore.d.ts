import SequenceDirection = require('./SequenceDirection');
declare class OrderedStore<T> {
    private lastKey;
    private store;
    constructor(items?: T[]);
    count: number;
    each(cb: (item: T, key: number) => void): void;
    indexOf(item: T): number;
    get(index: number): T;
    getAll(): T[];
    getNearWith(item: T, direction?: SequenceDirection): T;
    append(item: T, anchorItem?: T, direction?: SequenceDirection): void;
    replace(item: T, newItem: T): void;
    remove(item: any): void;
    private wrap(item);
}
export = OrderedStore;
