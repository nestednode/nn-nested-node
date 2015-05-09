define(["require", "exports", './SequenceDirection'], function (require, exports, SequenceDirection) {
    var OrderedStore = (function () {
        function OrderedStore(items) {
            var _this = this;
            this.lastKey = 0;
            this.store = items ? items.map(function (item) { return _this.wrap(item); }) : [];
        }
        Object.defineProperty(OrderedStore.prototype, "count", {
            get: function () {
                return this.store.length;
            },
            enumerable: true,
            configurable: true
        });
        OrderedStore.prototype.each = function (cb) {
            for (var i = 0; i < this.store.length; i++) {
                cb(this.store[i].value, this.store[i].key);
            }
        };
        OrderedStore.prototype.indexOf = function (item) {
            for (var i = 0; i < this.store.length; i++) {
                if (this.store[i].value === item)
                    return i;
            }
            return -1;
        };
        OrderedStore.prototype.get = function (index) {
            if (index < 0 || index > this.store.length - 1) {
                return null;
            }
            return this.store[index].value;
        };
        OrderedStore.prototype.getAll = function () {
            return this.store.map(function (storeItem) { return storeItem.value; });
        };
        OrderedStore.prototype.getNearWith = function (item, direction) {
            if (direction === void 0) { direction = 1 /* Following */; }
            var anchorIndex = this.indexOf(item);
            if (anchorIndex == -1) {
                throw new Error('anchor item not found in the store');
            }
            var targetIndex = anchorIndex + (direction === 1 /* Following */ ? 1 : -1);
            return this.get[targetIndex];
        };
        OrderedStore.prototype.append = function (item, anchorItem, direction) {
            var index = this.store.length;
            if (anchorItem !== undefined) {
                index = this.indexOf(anchorItem);
                if (index == -1) {
                    throw new Error('anchor item not found in the store');
                }
                if (direction === undefined || direction === 1 /* Following */) {
                    index++;
                }
            }
            this.store.splice(index, 0, this.wrap(item));
        };
        OrderedStore.prototype.replace = function (item, newItem) {
            var index = this.indexOf(item);
            if (index === -1) {
                throw new Error('item to replace not found in the store');
            }
            this.store.splice(index, 1, this.wrap(newItem));
        };
        OrderedStore.prototype.remove = function (item) {
            var index = this.indexOf(item);
            if (index == -1) {
                throw new Error('item to remove not found in the store');
            }
            this.store.splice(index, 1);
            //item.parent = null;
        };
        OrderedStore.prototype.wrap = function (item) {
            return { key: ++this.lastKey, value: item };
        };
        return OrderedStore;
    })();
    return OrderedStore;
});
