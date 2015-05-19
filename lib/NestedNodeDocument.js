var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/Collection/Collection', 'pkg/EventEmitter/EventEmitter', './NodeRelation', './Direction'], function (require, exports, Collection, EventEmitter, NodeRelation, Direction) {
    var NestedNodeDocument = (function (_super) {
        __extends(NestedNodeDocument, _super);
        function NestedNodeDocument() {
            var _this = this;
            _super.call(this);
            this.nodeRegistryCounter = 0;
            this.id = 'doc'; //todo something
            this.nodeRegistry = new Collection.Map();
            this.previouslyFocusedNested = new Collection.Map();
            this.addListener('focusChange', function () { return _this.emit('change'); });
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
            this.emit('focusChange', this.focusedNode.id); //todo передавать selection целиком
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
            this.focusNode(nested, extendSelection = false); // перемещение фокуса к nested всегда только сужает выделение
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
    })(EventEmitter);
    return NestedNodeDocument;
});
