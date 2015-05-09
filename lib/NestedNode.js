define(["require", "exports", './OrderedStore', './SequenceDirection'], function (require, exports, OrderedStore, SequenceDirection) {
    var NestedNode = (function () {
        // * Constructing
        // наследники должны проводить инициализацию объекта в не в конструкторе, а в методах init и clone,
        // не забывая вызывать перед этим соответствующие методы базового класса
        //sealed
        function NestedNode(ref) {
            // при создании узел всегда отвязан от родителя, даже если он клонируется
            this._parent = null;
            this._selected = false;
            ref ? this.clone(ref) : this.init();
        }
        Object.defineProperty(NestedNode.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.select = function (ensureNestedUnselected) {
            if (ensureNestedUnselected === void 0) { ensureNestedUnselected = false; }
            if (ensureNestedUnselected) {
                this.unselectDeep();
            }
            this._selected = true;
        };
        NestedNode.prototype.unselect = function () {
            this._selected = false;
        };
        NestedNode.prototype.unselectDeep = function () {
            this.getSelection().forEach(function (node) {
                node._selected = false;
            });
        };
        NestedNode.prototype.getSelection = function () {
            var res = [];
            this.each(function (node) {
                if (node._selected) {
                    res.push(node);
                }
            });
            return res;
        };
        Object.defineProperty(NestedNode.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "hasParent", {
            get: function () {
                return !!this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "root", {
            get: function () {
                return this._parent ? this._parent.root : this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "level", {
            get: function () {
                return this.hasParent ? (1 + this._parent.level) : 0;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.nested = function (index) {
            return this._nested.get(index);
        };
        Object.defineProperty(NestedNode.prototype, "firstNested", {
            get: function () {
                return this._nested.get(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "lastNested", {
            get: function () {
                return this._nested.get(this._nested.count - 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "nestedCount", {
            get: function () {
                return this._nested.count;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.getSibling = function (direction) {
            if (!this.hasParent) {
                return null;
            }
            return this._parent._nested.getNearWith(this, direction);
        };
        NestedNode.prototype.getSiblingWide = function (direction, preferredLevel) {
            var sibling = this.getSibling(direction);
            if (!sibling) {
                return this.hasParent ? this._parent.getSiblingWide(direction, preferredLevel) : null;
            }
            return sibling.getSiblingWidePhase2(direction, preferredLevel);
        };
        NestedNode.prototype.getSiblingWidePhase2 = function (direction, preferredLevel) {
            if (this.level === preferredLevel) {
                return this;
            }
            var nested = direction === 1 /* Following */ ? this.firstNested : this.lastNested;
            if (!nested) {
                return this;
            }
            return nested.getSiblingWidePhase2(direction, preferredLevel);
        };
        NestedNode.prototype.getPreceding = function (preferredLevel) {
            if (preferredLevel === void 0) { preferredLevel = this.level; }
            return this.getSiblingWide(0 /* Preceding */, preferredLevel);
        };
        NestedNode.prototype.getFollowing = function (preferredLevel) {
            if (preferredLevel === void 0) { preferredLevel = this.level; }
            return this.getSiblingWide(1 /* Following */, preferredLevel);
        };
        NestedNode.prototype.eachNested = function (cb) {
            this._nested.each(cb);
        };
        NestedNode.prototype.eachNestedDeep = function (cb) {
            this._nested.each(function (node) {
                cb(node);
                node.eachNestedDeep(cb);
            });
        };
        NestedNode.prototype.each = function (cb) {
            cb(this);
            this.eachNestedDeep(cb);
        };
        // * Tree Structure Manipulation
        // nested-related methods
        NestedNode.prototype.appendNested = function (node, anchorNode, direction) {
            node.makeParentless();
            this._nested.append(node, anchorNode, direction);
            node._parent = this;
        };
        NestedNode.prototype.removeNested = function (node) {
            this._nested.remove(node);
            node._parent = null;
        };
        NestedNode.prototype.replaceNested = function (node, newNode) {
            newNode.makeParentless();
            this._nested.replace(node, newNode);
        };
        // self-related methods
        NestedNode.prototype.attachToParent = function (parent, anchorNode, direction) {
            parent.appendNested(this, anchorNode, direction);
        };
        NestedNode.prototype.makeParentless = function () {
            if (this.hasParent) {
                this._parent.removeNested(this);
            }
        };
        NestedNode.prototype.substituteFor = function (newNode) {
            if (!this.hasParent) {
                throw new Error('cannot make substitution on parentless node');
            }
            this._parent.replaceNested(this, newNode);
        };
        NestedNode.prototype.duplicate = function () {
            var nodeCopy = this.getCopy();
            if (this.hasParent) {
                this._parent.appendNested(nodeCopy, this);
            }
            return nodeCopy;
        };
        NestedNode.prototype.init = function () {
            this._nested = new OrderedStore();
        };
        NestedNode.prototype.clone = function (ref) {
            this._nested = new OrderedStore(ref._nested.getAll().map(function (item) { return item.duplicate(); }));
        };
        NestedNode.prototype.getCopy = function () {
            //var copy = new this.constructor(this) // compilation fail
            //=> Cannot use 'new' with an expression whose type lacks a call or construct signature
            //http://stackoverflow.com/questions/14826973/a-reference-to-the-constructor-function
            return new ((function (obj) { return obj.constructor; })(this))(this);
        };
        return NestedNode;
    })();
    return NestedNode;
});
