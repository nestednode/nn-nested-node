define(["require", "exports"], function (require, exports) {
    var NestedNodeDocument = (function () {
        function NestedNodeDocument() {
        }
        NestedNodeDocument.prototype.focusNode = function (node, extendSelection) {
            if (extendSelection === void 0) { extendSelection = false; }
            if (!node) {
                return;
            }
            if (extendSelection) {
                if (node.selected) {
                    if (this.root.getSelection().length === 1) {
                        // нельзя снять выделение у единственного выбранного узла
                        // в finder, однако, в таком случае выбирается родительский
                        return;
                    }
                    node.unselect();
                    this.resetFocusedNode();
                    return;
                }
                var ensureNestedUnselected = true;
                node.select(ensureNestedUnselected);
                this.resetFocusedNode(node);
                return;
            }
            this.root.unselectDeep();
            node.select();
            this.resetFocusedNode(node);
        };
        NestedNodeDocument.prototype.focusNestedNode = function () {
            var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
            this.focusNode(nested);
        };
        NestedNodeDocument.prototype.focusParentNode = function () {
            this.focusNode(this.focusedNode.parent);
        };
        NestedNodeDocument.prototype.focusPrecedingNode = function (extendSelection) {
            if (extendSelection === void 0) { extendSelection = false; }
            var nodeBefore = this.focusedNode.getPreceding(this.currentFocusLevel);
            this.focusSiblingNode(nodeBefore, extendSelection);
        };
        NestedNodeDocument.prototype.focusFollowingNode = function (extendSelection) {
            if (extendSelection === void 0) { extendSelection = false; }
            var nodeAfter = this.focusedNode.getFollowing(this.currentFocusLevel);
            this.focusSiblingNode(nodeAfter, extendSelection);
        };
        NestedNodeDocument.prototype.focusSiblingNode = function (node, extendSelection) {
            if (extendSelection && this.focusedNode.selected && node && node.selected) {
                this.focusedNode.unselect();
                this.resetFocusedNode(node);
                return;
            }
            this.focusNode(node, extendSelection);
        };
        NestedNodeDocument.prototype.resetFocusedNode = function (node) {
            if (!node) {
                var selection = this.root.getSelection();
                node = selection[selection.length - 1];
            }
            this.focusedNode = node;
            if (node.hasParent) {
                this.previouslyFocusedNested.set(node.parent, node);
            }
        };
        return NestedNodeDocument;
    })();
    return NestedNodeDocument;
});
