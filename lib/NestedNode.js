define(["require", "exports", './Direction'], function (require, exports, Direction) {
    var NestedNode = (function () {
        // * Constructing
        function NestedNode(registry, props, dataDuplicator) {
            var _this = this;
            //this._id = registry.registerNode(this, props.id);
            this._id = registry.registerItem(this);
            this._parent = null;
            this._selected = false;
            this._focused = false;
            this._nested = props.nested ? props.nested.map(function (nestedProps) {
                var nested = new NestedNode(registry, nestedProps, dataDuplicator);
                nested._parent = _this;
                return nested;
            }) : [];
            this.nested = {
                map: this._nested.map.bind(this._nested),
                forEach: this._nested.forEach.bind(this._nested)
            };
            this.data = dataDuplicator(props.data);
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
        Object.defineProperty(NestedNode.prototype, "isTopLevel", {
            get: function () {
                return this.hasParent && !this.parent.hasParent;
            },
            enumerable: true,
            configurable: true
        });
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
            if (direction === void 0) { direction = Direction.getForward(); }
            if (sameParentOnly === void 0) { sameParentOnly = true; }
            if (!this.hasParent) {
                throw new Error('cannot get sibling on parentless node');
            }
            return sameParentOnly ? this.getImmediateSibling(direction) : this.getCrossSibling(direction, preferredLevel || this.level);
        };
        NestedNode.prototype.getDirectionToSibling = function (node) {
            if (this === node) {
                return null;
            }
            if (!this._parent || this._parent !== node._parent) {
                throw new Error('passed node must have the same parent');
            }
            var selfIndex = this._parent._nested.indexOf(this);
            var targetIndex = this._parent._nested.indexOf(node);
            return targetIndex > selfIndex ? Direction.getForward() : Direction.getBackward();
        };
        NestedNode.prototype.getImmediateSibling = function (direction) {
            if (!this.hasParent) {
                return null;
            }
            var selfIndex = this._parent._nested.indexOf(this);
            var targetIndex = selfIndex + (direction.isForward ? 1 : -1);
            return this._parent._nested[targetIndex];
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
        // если указан aheadNode, то добавляет узел перед ним, если нет, то добавляет в конец
        NestedNode.prototype.appendNested = function (node, aheadNode) {
            if (node.hasParent) {
                throw new Error('cannot append node attached to another parent');
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
        };
        NestedNode.prototype.removeNested = function (node) {
            var index = this._nested.indexOf(node);
            if (index == -1) {
                throw new Error('no such node in nested');
            }
            this._nested.splice(index, 1);
            node._parent = null;
            return node;
        };
        // ** Self-Related Methods
        NestedNode.prototype.appendToParent = function (parent, aheadNode) {
            return parent.appendNested(this, aheadNode);
        };
        NestedNode.prototype.removeFormParent = function () {
            if (!this.hasParent) {
                throw new Error('node is already parentless');
            }
            return this._parent.removeNested(this);
        };
        NestedNode.prototype.arrangeBefore = function (node) {
            if (!this.hasParent) {
                throw new Error('cannot arrange parentless node');
            }
            var parent = this._parent;
            return this.removeFormParent().appendToParent(parent, node);
        };
        Object.defineProperty(NestedNode.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.select = function () {
            this._selected = true;
            return this;
        };
        NestedNode.prototype.unselect = function () {
            this._selected = false;
            return this;
        };
        NestedNode.prototype.unselectDeep = function () {
            this.getSelection().forEach(function (node) {
                node._selected = false;
            });
            return this;
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
        Object.defineProperty(NestedNode.prototype, "focused", {
            get: function () {
                return this._focused;
            },
            enumerable: true,
            configurable: true
        });
        NestedNode.prototype.focus = function () {
            this._focused = true;
            return this;
        };
        NestedNode.prototype.unfocus = function () {
            this._focused = false;
            return this;
        };
        NestedNode.prototype.cloneProps = function (dataDuplicator) {
            return {
                data: dataDuplicator(this.data),
                nested: this._nested.map(function (node) { return node.cloneProps(dataDuplicator); })
            };
        };
        return NestedNode;
    })();
    return NestedNode;
});
