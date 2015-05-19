define(["require", "exports"], function (require, exports) {
    var NestedNode = (function () {
        // * Constructing
        function NestedNode(registry, data, dataDuplicator) {
            var _this = this;
            //this._id = registry.registerNode(this, data.id);
            this._id = registry.registerNode(this);
            this._parent = null;
            this._selected = false;
            this._nested = data.nested ? data.nested.map(function (nestedData) {
                var nested = new NestedNode(registry, nestedData, dataDuplicator);
                nested._parent = _this;
                return nested;
            }) : [];
            this.data = dataDuplicator(data);
            this.data.owner = this;
            this.data.nested = {
                map: this.mapNestedData.bind(this),
                forEach: this.forEachNestedData.bind(this)
            };
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
        NestedNode.prototype.mapNested = function (cb, thisArg) {
            return this._nested.map(cb, thisArg);
        };
        NestedNode.prototype.forEachNested = function (cb, thisArg) {
            this._nested.forEach(cb, thisArg);
        };
        NestedNode.prototype.forEachNestedDeep = function (cb) {
            this._nested.forEach(function (node) {
                cb(node);
                node.forEachNestedDeep(cb);
            });
        };
        NestedNode.prototype.traverse = function (cb) {
            cb(this);
            this.forEachNestedDeep(cb);
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
        NestedNode.prototype.forEachNestedData = function (cb, thisArg) {
            this._nested.forEach(function (node) { return cb(node.data, node._id); }, thisArg);
        };
        NestedNode.prototype.mapNestedData = function (cb, thisArg) {
            return this._nested.map(function (node) { return cb(node.data, node._id); }, thisArg);
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
            this.traverse(function (node) {
                if (node._selected) {
                    res.push(node);
                }
            });
            return res;
        };
        return NestedNode;
    })();
    return NestedNode;
});
