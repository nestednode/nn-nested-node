import Direction = require('./Direction');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import NestedData = require('./NestedData');


class NestedNode<D extends NestedData<{}>> {

    // * Identity

    //private registry: NestedNodeRegistry<NestedNode<D>>;
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

    get isTopLevel(): boolean {
        return this.hasParent && !this.parent.hasParent;
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

    getSibling(direction = Direction.getForward(), sameParentOnly = true, preferredLevel?: number) {
        if (! this.hasParent) {
            throw new Error('cannot get sibling on parentless node');
        }
        return sameParentOnly ?
            this.getImmediateSibling(direction) :
            this.getCrossSibling(direction, preferredLevel || this.level);
    }

    getDirectionToSibling(node: NestedNode<D>): Direction {
        if (this === node) {
            return null;
        }
        if (!this._parent || this._parent !== node._parent) {
            throw new Error('passed node must have the same parent');
        }
        var selfIndex = this._parent._nested.indexOf(this);
        var targetIndex = this._parent._nested.indexOf(node);
        return targetIndex > selfIndex ? Direction.getForward() : Direction.getBackward();
    }

    private getImmediateSibling(direction: Direction): NestedNode<D> {
        if (! this.hasParent) {
            return null;
        }
        var selfIndex = this._parent._nested.indexOf(this);
        var targetIndex = selfIndex + (direction.isForward ? 1 : -1);
        return this._parent._nested[targetIndex];
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


    // * Data

    data: D;

    forEachNestedData(cb: (data: D, key) => void, thisArg?) {
        this._nested.forEach(node => cb(node.data, node._id), thisArg);
    }

    mapNestedData<T>(cb: (data: D, key) => T, thisArg?): T[] {
        return this._nested.map(node => cb(node.data, node._id), thisArg);
    }


    // * Tree Structure Manipulation

    // ** Nested-Related Methods

    // если указан aheadNode, то добавляет узел перед ним, если нет, то добавляет в конец
    appendNested(node: NestedNode<D>, aheadNode?: NestedNode<D>): NestedNode<D> {
        if (node.hasParent) {
            throw new Error('cannot append node attached to another parent')
        }
        var index = this._nested.length;
        if (aheadNode) {
            index = this._nested.indexOf(aheadNode);
            if (index == -1) {
                throw new Error('anchor node not exists in nested');
            }
        }
        this._nested.splice(index, 0, node);
        node._parent = this;
        return node;
    }

    removeNested(node: NestedNode<D>): NestedNode<D> {
        var index = this._nested.indexOf(node);
        if (index == -1) {
            throw new Error('no such node in nested');
        }
        this._nested.splice(index, 1);
        node._parent = null;
        return node;
    }

    replaceNested(node: NestedNode<D>, newNode: NestedNode<D>): void {
        if (newNode.hasParent) {
            throw new Error('cannot place node attached to another parent');
        }
        var index = this._nested.indexOf(node);
        if (index === -1) {
            throw new Error('node to replace not exists in nested');
        }
        this._nested.splice(index, 1, newNode);
        node._parent = null;
    }

    // ** Self-Related Methods

    appendToParent(parent: NestedNode<D>, aheadNode?: NestedNode<D>): NestedNode<D> {
        return parent.appendNested(this, aheadNode);
    }

    removeFormParent(): NestedNode<D> {
        if (! this.hasParent) {
            throw new Error('node is already parentless');
        }
        return this._parent.removeNested(this);
    }

    arrangeBefore(node: NestedNode<D>): NestedNode<D> {
        if (! this.hasParent) {
            throw new Error('cannot arrange parentless node');
        }
        var parent = this._parent;
        return this.removeFormParent().appendToParent(parent, node);
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

    select(): NestedNode<D> {
        this._selected = true;
        return this;
    }

    unselect(): NestedNode<D> {
        this._selected = false;
        return this;
    }

    unselectDeep(): NestedNode<D> {
        this.getSelection().forEach(node => { node._selected = false });
        return this;
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
        //this._id = registry.registerNode(this, data.id);
        this._id = registry.registerNode(this);
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


module NestedNode {
    export interface AnyNestedNode extends NestedNode<any> {}
}


export = NestedNode;
