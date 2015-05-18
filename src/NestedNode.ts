import Direction = require('./Direction');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import NestedData = require('./NestedData');


class NestedNode<D extends NestedData<any>> {

    // * Identity

    private registry: NestedNodeRegistry<any>;
    // по-идее, хранить ссылку на реестр может быть полезно,
    // чтобы узел при добавленни другого мог проверять,
    // к одному ли id-space они принадлежат

    private _id: string;

    get id(): string {
        return this._id;
    }

    // * Tree Structure

    private _parent: NestedNode<D>;

    get parent(): NestedNode<D> {
        return this._parent;
    }

    get hasParent(): boolean {
        return !!this._parent
    }

    get root(): NestedNode<D> {
        return this._parent ? this._parent.root : this;
    }

    get level(): number {
        return this.hasParent ? (1 + this._parent.level) : 0
    }

    // ** Nested

    private _nested: NestedNode<D>[];

    nested(index: number): NestedNode<D> {
        return this._nested[index];
    }

    get firstNested(): NestedNode<D> {
        return this._nested[0];
    }

    get lastNested(): NestedNode<D> {
        return this._nested[this._nested.length - 1];
    }

    get nestedCount(): number {
        return this._nested.length;
    }


    mapNested<T>(cb: (node: NestedNode<D>) => T, thisArg?): T[] {
        return this._nested.map(cb, thisArg);
    }

    forEachNested(cb: (node: NestedNode<D>) => void, thisArg?): void {
        this._nested.forEach(cb, thisArg);
    }

    forEachNestedDeep(cb: (node: NestedNode<D>) => void): void {
        this._nested.forEach(node => {
            cb(node);
            node.forEachNestedDeep(cb);
        })
    }

    traverse(cb: (node: NestedNode<D>) => void): void {
        cb(this);
        this.forEachNestedDeep(cb);
    }

    // ** Siblings

    getSibling(direction: Direction, sameParentOnly = false, preferredLevel?: number) {
        return sameParentOnly ?
            this.getImmediateSibling(direction) :
            this.getCrossSibling(direction, preferredLevel || this.level);
    }

    private getImmediateSibling(direction: Direction): NestedNode<D> {
        if (! this.hasParent) {
            return null;
        }
        var selfIndex = this._parent._nested.indexOf(this);
        var targetIndex = selfIndex + (direction.isForward ? 1 : -1);
        return this._nested[targetIndex];
    }

    private getCrossSibling(direction: Direction, preferredLevel: number): NestedNode<D> {
        var sibling = this.getImmediateSibling(direction);
        if (! sibling) {
            return this.hasParent ? this._parent.getCrossSibling(direction, preferredLevel) : null;
        }
        return sibling.getCrossSiblingPhase2(direction, preferredLevel);
    }

    private getCrossSiblingPhase2(direction: Direction, preferredLevel: number): NestedNode<D> {
        if (this.level === preferredLevel) {
            return this;
        }
        var nested = direction.isForward ? this.firstNested : this.lastNested;
        if (! nested) {
            return this;
        }
        return nested.getCrossSiblingPhase2(direction, preferredLevel);
    }


    // ** Data

    data: D;

    forEachNestedData(cb: (data: D, id) => void, thisArg?) {
        this._nested.forEach(node => cb(node.data, node._id), thisArg);
    }

    mapNestedData<T>(cb: (data: D, id) => T, thisArg?): T[] {
        return this._nested.map(node => cb(node.data, node._id), thisArg);
    }


    // * Tree Structure Manipulation

    // ** Nested-Related Methods

    appendNested(node: NestedNode<D>, anchorNode?: NestedNode<D>, direction?: Direction): void {
        node.makeParentless();
        var index = this._nested.length;
        if (anchorNode) {
            index = this._nested.indexOf(anchorNode);
            if (index == -1) {
                throw new Error('anchor node not exists in nested');
            }
            if (direction === undefined || direction.isForward) {
                index++;
            }
        }
        this._nested.splice(index, 0, node);
        node._parent = this;
    }

    removeNested(node: NestedNode<D>): void {
        var index = this._nested.indexOf(node);
        if (index == -1) {
            throw new Error('no such node in nested');
        }
        this._nested.splice(index, 1);
        node._parent = null;
    }

    replaceNested(node: NestedNode<D>, newNode: NestedNode<D>): void {
        newNode.makeParentless();
        var index = this._nested.indexOf(node);
        if (index === -1) {
            throw new Error('node to replace not exists in nested');
        }
        this._nested.splice(index, 1, newNode);
        node._parent = null;
    }

    // ** Self-Related Methods

    attachToParent(parent: NestedNode<D>): void {
        parent.appendNested(this);
    }

    makeParentless(): void {
        if (this.hasParent) {
            this._parent.removeNested(this);
        }
    }

    substituteFor(newNode: NestedNode<D>): void {
        if (!this.hasParent) {
            throw new Error('cannot make substitution on parentless node')
        }
        this._parent.replaceNested(this, newNode);
    }


    // * Selection

    private _selected: boolean;

    get selected(): boolean {
        return this._selected;
    }

    select(ensureNestedUnselected = false): void {
        if (ensureNestedUnselected) {
            this.unselectDeep();
        }
        this._selected = true;
    }

    unselect(): void {
        this._selected = false;
    }

    unselectDeep(): void {
        this.getSelection().forEach(node => { node._selected = false })
    }

    getSelection(): NestedNode<D>[] {
        var res = [];
        this.traverse(node => {
            if (node._selected) {
                res.push(node);
            }
        });
        return res;
    }


    // * Constructing

    constructor(registry: NestedNodeRegistry<any>, data: D, dataDuplicator: (src: D) => D) {
        this._id = registry.registerNode(this, data.id);
        this._parent = null;
        this._selected = false;
        this._nested = data.nested ? data.nested.map((nestedData: D) => {
            var nested = new NestedNode<D>(registry, nestedData, dataDuplicator);
            nested._parent = this;
            return nested;
        }) : [];
        this.data = dataDuplicator(data);
        this.data.owner = this;
        this.data.nested = {
            map: this.mapNestedData.bind(this),
            forEach: this.forEachNestedData.bind(this)
        };
    }

}


export = NestedNode;
