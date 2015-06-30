import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import Direction = require('./Direction');
import ObjectRegistry = require('./ObjectRegistry');


class NestedNode<D> implements NestedNodeProps<D> {

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

    nested: NestedNodeProps.Nested<D>;

    get firstNested(): NestedNode<D> {
        return this._nested[0];
    }

    get lastNested(): NestedNode<D> {
        return this._nested[this._nested.length - 1];
    }

    get nestedCount(): number {
        return this._nested.length;
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
        this.traverse(node => { // можно оптимизировать, не обязательно обходить дочерних у выбранного
            if (node._selected) {
                res.push(node);
            }
        });
        return res;
    }

    _focused: boolean;

    get focused(): boolean {
        return this._focused;
    }

    focus(): NestedNode<D> {
        this._focused = true;
        return this;
    }

    unfocus(): NestedNode<D> {
        this._focused = false;
        return this;
    }

    // * Data

    data: D;

    cloneProps(dataDuplicator: (src: D) => D): NestedNodeProps<D> {
        return {
            data: dataDuplicator(this.data),
            nested: this._nested.map(node => node.cloneProps(dataDuplicator))
        }
    }

    // * Constructing

    constructor(registry: ObjectRegistry<any>, props: NestedNodeProps<D>, dataDuplicator: (src: D) => D) {
        //this._id = registry.registerItem(this, props.id); // если id будут внешние
        this._id = registry.registerItem(this);
        this._parent = null;
        this._selected = false;
        this._focused = false;
        this._nested = props.nested ? props.nested.map(nestedProps => {
            var nested = new NestedNode<D>(registry, nestedProps, dataDuplicator);
            nested._parent = this;
            return nested;
        }) : [];
        this.nested = {
            map: this._nested.map.bind(this._nested),
            forEach: this._nested.forEach.bind(this._nested)
        };
        this.data = dataDuplicator(props.data);
    }

}


module NestedNode {
    export interface AnyNestedNode extends NestedNode<any> {}
}


export = NestedNode;
