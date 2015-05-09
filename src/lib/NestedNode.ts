import OrderedStore = require('./OrderedStore');
import SequenceDirection = require('./SequenceDirection');


class NestedNode {

    // * Node props

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

    getSelection(): NestedNode[] {
        var res = [];
        this.each(node => {
            if (node._selected) {
                res.push(node);
            }
        });
        return res;
    }

    // * Tree Structure

    private _parent: NestedNode;

    get parent(): NestedNode {
        return this._parent;
    }

    get hasParent(): boolean {
        return !!this._parent
    }

    get root(): NestedNode {
        return this._parent ? this._parent.root : this;
    }

    get level(): number {
        return this.hasParent ? (1 + this._parent.level) : 0
    }

    // * Nested

    private _nested: OrderedStore<NestedNode>;

    nested(index: number): NestedNode {
        return this._nested.get(index);
    }

    get firstNested(): NestedNode {
        return this._nested.get(0);
    }

    get lastNested(): NestedNode {
        return this._nested.get(this._nested.count - 1);
    }

    get nestedCount(): number {
        return this._nested.count;
    }

    getSibling(direction: SequenceDirection): NestedNode {
        if (! this.hasParent) {
            return null;
        }
        return this._parent._nested.getNearWith(this, direction);
    }

    getSiblingWide(direction: SequenceDirection, preferredLevel: number): NestedNode {
        var sibling = this.getSibling(direction);
        if (! sibling) {
            return this.hasParent ? this._parent.getSiblingWide(direction, preferredLevel) : null;
        }
        return sibling.getSiblingWidePhase2(direction, preferredLevel);
    }

    private getSiblingWidePhase2(direction: SequenceDirection, preferredLevel: number): NestedNode {
        if (this.level === preferredLevel) {
            return this;
        }
        var nested = direction === SequenceDirection.Following ? this.firstNested : this.lastNested;
        if (! nested) {
            return this;
        }
        return nested.getSiblingWidePhase2(direction, preferredLevel);
    }

    getPreceding(preferredLevel = this.level) {
        return this.getSiblingWide(SequenceDirection.Preceding, preferredLevel);
    }

    getFollowing(preferredLevel = this.level) {
        return this.getSiblingWide(SequenceDirection.Following, preferredLevel);
    }



    eachNested(cb: (node: NestedNode, key: number) => void): void {
        this._nested.each(cb);
    }

    eachNestedDeep(cb: (node: NestedNode) => void): void {
        this._nested.each(node => {
            cb(node);
            node.eachNestedDeep(cb);
        })
    }

    each(cb: (node: NestedNode) => void): void {
        cb(this);
        this.eachNestedDeep(cb);
    }

    // * Tree Structure Manipulation

    // nested-related methods

    appendNested(node: NestedNode, anchorNode?: NestedNode, direction?: SequenceDirection): void {
        node.makeParentless();
        this._nested.append(node, anchorNode, direction);
        node._parent = this;
    }

    removeNested(node: NestedNode): void {
        this._nested.remove(node);
        node._parent = null;
    }

    replaceNested(node: NestedNode, newNode: NestedNode): void {
        newNode.makeParentless();
        this._nested.replace(node, newNode);
    }

    // self-related methods

    attachToParent(parent: NestedNode, anchorNode?: NestedNode, direction?: SequenceDirection): void {
        parent.appendNested(this, anchorNode, direction);
    }

    makeParentless(): void {
        if (this.hasParent) {
            this._parent.removeNested(this);
        }
    }

    substituteFor(newNode: NestedNode): void {
        if (!this.hasParent) {
            throw new Error('cannot make substitution on parentless node')
        }
        this._parent.replaceNested(this, newNode);
    }

    duplicate(): NestedNode {
        var nodeCopy = this.getCopy();
        if (this.hasParent) {
            this._parent.appendNested(nodeCopy, this);
        }
        return nodeCopy;
    }

    // * Constructing

    // наследники должны проводить инициализацию объекта в не в конструкторе, а в методах init и clone,
    // не забывая вызывать перед этим соответствующие методы базового класса

    //sealed
    constructor(ref?: NestedNode) {
        // при создании узел всегда отвязан от родителя, даже если он клонируется
        this._parent = null;
        this._selected = false;
        ref ? this.clone(ref) : this.init();
    }

    protected init()  {
        this._nested = new OrderedStore<NestedNode>();
    }

    protected clone(ref: NestedNode) {
        this._nested = new OrderedStore<NestedNode>(ref._nested.getAll().map(item => item.duplicate()));
    }

    getCopy(): NestedNode {
        //var copy = new this.constructor(this) // compilation fail
        //=> Cannot use 'new' with an expression whose type lacks a call or construct signature
        //http://stackoverflow.com/questions/14826973/a-reference-to-the-constructor-function
        return new ((obj => obj.constructor)(this))(this);
    }

}


export = NestedNode;
