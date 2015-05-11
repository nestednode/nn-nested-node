define(["require", "exports", './lib/NodeRelation', './lib/Direction'], function (require, exports, NodeRelation, Direction) {
    var NestedNodeDocument = (function () {
        function NestedNodeDocument() {
            this.nodeRegistryCounter = 0;
        }
        // * Node Registry
        NestedNodeDocument.prototype.registerNode = function (node) {
            //todo check if node not already registred
            var nodeId = this.id + '-' + ++this.nodeRegistryCounter;
            this.nodeRegistry.set(nodeId, node);
            return nodeId;
        };
        NestedNodeDocument.prototype.unregisterNode = function (node) {
            this.nodeRegistry.delete(node.id);
            //todo cleanup previouslyFocusedNested
        };
        NestedNodeDocument.prototype.getNodeById = function (id) {
            return this.nodeRegistry.get(id);
        };
        // * Document Actions
        // ** Actions With Focused Node
        NestedNodeDocument.prototype.focusNodeById = function (id, extendSelection) {
            if (extendSelection === void 0) { extendSelection = false; }
            this.focusNode(this.getNodeById(id), extendSelection);
        };
        NestedNodeDocument.prototype.focusRelatedNode = function (targetNodeRelation, extendSelection) {
            if (extendSelection === void 0) { extendSelection = false; }
            switch (targetNodeRelation) {
                case 0 /* Parent */:
                    this.focusParentNode();
                    break;
                case 1 /* Nested */:
                    this.focusNestedNode();
                    break;
                case 2 /* PrecedingSibling */:
                    this.focusSiblingNode(Direction.getBackward(), extendSelection);
                    break;
                case 3 /* FollowingSibling */:
                    this.focusSiblingNode(Direction.getForward(), extendSelection);
                    break;
            }
        };
        NestedNodeDocument.prototype.focusNode = function (node, extendSelection) {
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
                    this.makeNodeFocused();
                    return;
                }
                var ensureNestedUnselected;
                node.select(ensureNestedUnselected = true);
                this.makeNodeFocused(node);
                return;
            }
            this.root.unselectDeep();
            node.select();
            this.makeNodeFocused(node);
        };
        NestedNodeDocument.prototype.focusNestedNode = function () {
            var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
            var extendSelection;
            this.focusNode(nested, extendSelection = false); // перемещение фокуса к nested только сужает выделение
        };
        NestedNodeDocument.prototype.focusParentNode = function () {
            var extendSelection;
            this.focusNode(this.focusedNode.parent, extendSelection = false); // перемещение к parent и так его расшриряет
        };
        NestedNodeDocument.prototype.focusSiblingNode = function (direction, extendSelection) {
            var sameParentOnly;
            var node = this.focusedNode.getSibling(direction, sameParentOnly = false, this.currentFocusLevel);
            if (extendSelection && this.focusedNode.selected && node && node.selected) {
                this.focusedNode.unselect();
                this.makeNodeFocused(node);
                return;
            }
            this.focusNode(node, extendSelection);
        };
        NestedNodeDocument.prototype.makeNodeFocused = function (node) {
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
