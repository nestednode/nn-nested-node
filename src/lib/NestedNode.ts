import SequenceDirection = require('./SequenceDirection');
import NestedNodeRegistry = require('./NestedNodeRegistry');


class NestedNode {

    // * Identity

    private registry: NestedNodeRegistry;

    private _id: string;

    get id(): string {
        return this._id;
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

    // ** Nested

    private _nested: NestedNode[];

    nested(index: number): NestedNode {
        return this._nested[index];
    }

    get firstNested(): NestedNode {
        return this._nested[0];
    }

    get lastNested(): NestedNode {
        return this._nested[this._nested.length - 1];
    }

    get nestedCount(): number {
        return this._nested.length;
    }

    eachNested(cb: (node: NestedNode) => void): void {
        this._nested.forEach(cb);
    }

    eachNestedDeep(cb: (node: NestedNode) => void): void {
        this._nested.forEach(node => {
            cb(node);
            node.eachNestedDeep(cb);
        })
    }

    // eachNestedDeepAndSelf
    each(cb: (node: NestedNode) => void): void {
        cb(this);
        this.eachNestedDeep(cb);
    }

    // ** Siblings

    getSibling(direction: SequenceDirection): NestedNode {
        if (! this.hasParent) {
            return null;
        }
        var selfIndex = this._nested.indexOf(this);
        if (selfIndex == -1) {
            throw new Error('anchor item not found in the store');
        }
        var targetIndex = selfIndex + (direction === SequenceDirection.Following ? 1 : -1);
        return this._nested[targetIndex];
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


    // * Tree Structure Manipulation

    // ** Nested-Related Methods

    appendNested(node: NestedNode, anchorNode?: NestedNode, direction?: SequenceDirection): void {

        node.makeParentless();

        var index = this._nested.length;
        if (anchorNode) {
            index = this._nested.indexOf(anchorNode);
            if (index == -1) {
                throw new Error('anchor node not exists in nested');
            }
            //todo
            if (direction || direction === SequenceDirection.Following) {
                index++;
            }
        }
        this._nested.splice(index, 0, node);

        node._parent = this;
    }

    removeNested(node: NestedNode): void {
        var index = this._nested.indexOf(node);
        if (index == -1) {
            throw new Error('no such node in nested');
        }
        this._nested.splice(index, 1);
        node._parent = null;
    }

    replaceNested(node: NestedNode, newNode: NestedNode): void {
        newNode.makeParentless();
        var index = this._nested.indexOf(node);
        if (index === -1) {
            throw new Error('node to replace not exists in nested');
        }
        this._nested.splice(index, 1, newNode);
        node._parent = null;
    }

    // ** Self-Related Methods

    attachToParent(parent: NestedNode): void {
        parent.appendNested(this);
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

    getSelection(): NestedNode[] {
        var res = [];
        this.each(node => {
            if (node._selected) {
                res.push(node);
            }
        });
        return res;
    }


    // * Constructing

    // наследники должны проводить инициализацию объекта в не в конструкторе, а в методах init и clone,
    // не забывая вызывать при этoм соответствующие методы базового класса

    //sealed
    constructor(registry: NestedNodeRegistry, ref?: NestedNode) {
        // при создании узел всегда отвязан от родителя, даже если он клонируется
        this.registry = registry;
        this._id = this.registry.register(this);
        this._parent = null;
        this._selected = false;
        ref ? this.clone(ref) : this.init();
    }

    protected init()  {
        this._nested = [];
    }

    protected clone(ref: NestedNode) {
        this._nested = ref._nested.map(node => {
            var copy = node.getCopy();
            copy._parent = this;
            return copy;
        });
    }

    getCopy(): NestedNode {
        //var copy = new this.constructor(this) // compilation fail
        //=> Cannot use 'new' with an expression whose type lacks a call or construct signature
        //http://stackoverflow.com/questions/14826973/a-reference-to-the-constructor-function
        return new ((obj => obj.constructor)(this))(this.registry, this);
    }

}


export = NestedNode;
