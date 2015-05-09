import SequenceDirection = require('./SequenceDirection');


class OrderedStore<T> {

    private lastKey: number;
    private store: Array<{key: number; value: T}>;

    constructor(items?: T[]) {
        this.lastKey = 0;
        this.store = items ? items.map(item => this.wrap(item)) : [];
    }

    get count() {
        return this.store.length;
    }

    each(cb: (item: T, key: number) => void): void {
        for (var i = 0; i < this.store.length; i++) {
            cb(this.store[i].value, this.store[i].key);
        }
    }

    indexOf(item: T): number {
        for (var i = 0; i < this.store.length; i++) {
            if (this.store[i].value === item)
                return i;
        }
        return -1;
    }

    get(index: number): T {
        if (index < 0 || index > this.store.length - 1) {
            return null;
        }
        return this.store[index].value;
    }

    getAll(): T[] {
        return this.store.map(storeItem => storeItem.value);
    }

    getNearWith(item: T, direction: SequenceDirection = SequenceDirection.Following): T {
        var anchorIndex = this.indexOf(item);
        if (anchorIndex == -1) {
            throw new Error('anchor item not found in the store');
        }
        var targetIndex = anchorIndex + (direction === SequenceDirection.Following ? 1 : -1);
        return this.get[targetIndex];
    }

    append(item: T, anchorItem?: T, direction?: SequenceDirection): void {
        var index = this.store.length;
        if (anchorItem !== undefined) {
            index = this.indexOf(anchorItem);
            if (index == -1) {
                throw new Error('anchor item not found in the store');
            }
            if (direction === undefined || direction === SequenceDirection.Following) {
                index++;
            }
        }
        this.store.splice(index, 0, this.wrap(item));
    }

    replace(item: T, newItem: T): void {
        var index = this.indexOf(item);
        if (index === -1) {
            throw new Error('item to replace not found in the store');
        }
        this.store.splice(index, 1, this.wrap(newItem));
    }

    remove(item): void {
        var index = this.indexOf(item);
        if (index == -1) {
            throw new Error('item to remove not found in the store');
        }
        this.store.splice(index, 1);
        //item.parent = null;
    }

    private wrap(item: T) {
        return {key: ++this.lastKey, value: item};
    }

}


export = OrderedStore;
