define(["require", "exports"], function (require, exports) {
    var NestedNode = (function () {
        // * Constructing
        // наследники должны проводить инициализацию объекта в не в конструкторе, а в методах init и clone,
        // не забывая вызывать при этoм соответствующие методы базового класса
        //sealed
        function NestedNode(registry, ref) {
            // при создании узел всегда отвязан от родителя, даже если он клонируется
            this.registry = registry;
            this._id = this.registry.register(this);
            this._parent = null;
            this._selected = false;
            ref ? this.clone(ref) : this.init();
        }
        Object.defineProperty(NestedNode.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
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
            return this._nested[index];
        };
        Object.defineProperty(NestedNode.prototype, "firstNested", {
            get: function () {
                return this._nested[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "lastNested", {
            get: function () {
                return this._nested[this._nested.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NestedNode.prototype, "nestedCount", {
            get: function () {
                return this._nested.length;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.eachNested = function (cb) {
            this._nested.forEach(cb);
        };
        NestedNode.prototype.eachNestedDeep = function (cb) {
            this._nested.forEach(function (node) {
                cb(node);
                node.eachNestedDeep(cb);
            });
        };
        // eachNestedDeepAndSelf
        NestedNode.prototype.each = function (cb) {
            cb(this);
            this.eachNestedDeep(cb);
        };
        // ** Siblings
        NestedNode.prototype.getSibling = function (direction, sameParentOnly, preferredLevel) {
            if (sameParentOnly === void 0) { sameParentOnly = false; }
            return sameParentOnly ? this.getImmediateSibling(direction) : this.getCrossSibling(direction, preferredLevel || this.level);
        };
        NestedNode.prototype.getImmediateSibling = function (direction) {
            if (!this.hasParent) {
                return null;
            }
            var selfIndex = this._parent._nested.indexOf(this);
            var targetIndex = selfIndex + (direction.isForward ? 1 : -1);
            return this._nested[targetIndex];
        };
        NestedNode.prototype.getCrossSibling = function (direction, preferredLevel) {
            var sibling = this.getImmediateSibling(direction);
            if (!sibling) {
                return this.hasParent ? this._parent.getCrossSibling(direction, preferredLevel) : null;
            }
            return sibling.getCrossSiblingPhase2(direction, preferredLevel);
        };
        NestedNode.prototype.getCrossSiblingPhase2 = function (direction, preferredLevel) {
            if (this.level === preferredLevel) {
                return this;
            }
            var nested = direction.isForward ? this.firstNested : this.lastNested;
            if (!nested) {
                return this;
            }
            return nested.getCrossSiblingPhase2(direction, preferredLevel);
        };
        // * Tree Structure Manipulation
        // ** Nested-Related Methods
        NestedNode.prototype.appendNested = function (node, anchorNode, direction) {
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
        };
        NestedNode.prototype.removeNested = function (node) {
            var index = this._nested.indexOf(node);
            if (index == -1) {
                throw new Error('no such node in nested');
            }
            this._nested.splice(index, 1);
            node._parent = null;
        };
        NestedNode.prototype.replaceNested = function (node, newNode) {
            newNode.makeParentless();
            var index = this._nested.indexOf(node);
            if (index === -1) {
                throw new Error('node to replace not exists in nested');
            }
            this._nested.splice(index, 1, newNode);
            node._parent = null;
        };
        // ** Self-Related Methods
        NestedNode.prototype.attachToParent = function (parent) {
            parent.appendNested(this);
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
        NestedNode.prototype.init = function () {
            this._nested = [];
        };
        NestedNode.prototype.clone = function (ref) {
            var _this = this;
            this._nested = ref._nested.map(function (node) {
                var copy = node.getCopy();
                copy._parent = _this;
                return copy;
            });
        };
        NestedNode.prototype.getCopy = function () {
            //var copy = new this.constructor(this) // compilation fail
            //=> Cannot use 'new' with an expression whose type lacks a call or construct signature
            //http://stackoverflow.com/questions/14826973/a-reference-to-the-constructor-function
            return new ((function (obj) { return obj.constructor; })(this))(this.registry, this);
        };
        return NestedNode;
    })();
    return NestedNode;
});
