var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/Collection/Collection', 'pkg/EventEmitter/EventEmitter', './NestedNode', './Direction', './SelectionMode', './SelectionHelper', './Command/AppendCommand', './Command/RemoveCommand'], function (require, exports, Collection, EventEmitter, NestedNode, Direction, SelectionMode, SelectionHelper, AppendCommand, RemoveCommand) {
    var NestedNodeDocument = (function (_super) {
        __extends(NestedNodeDocument, _super);
        function NestedNodeDocument(data) {
            var _this = this;
            _super.call(this);
            this.nodeRegistryCounter = 0;
            this.id = 'doc'; //todo something
            this.nodeRegistry = new Collection.Map();
            this.previouslyFocusedNested = new Collection.Map();
            this.root = new NestedNode(this, data, this.nodeDataDuplicator);
            this.focusNode(this.root);
            this.addListener('focusChange', function () { return _this.emit('change'); });
            this.addListener('contentChange', function () { return _this.emit('change'); });
        }
        Object.defineProperty(NestedNodeDocument.prototype, "content", {
            get: function () {
                return this.root.data;
            },
            enumerable: true,
            configurable: true
        });
        // * Abstract Node Data methods
        NestedNodeDocument.prototype.getBlankNodeData = function () {
            throw new Error('abstract method');
        };
        // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
        NestedNodeDocument.prototype.nodeDataDuplicator = function (data) {
            throw new Error('abstract method');
        };
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
        NestedNodeDocument.prototype.focusNodeById = function (id, selectionMode) {
            var node = this.getNodeById(id);
            if (!node) {
                console.warn('No node found with id: ' + id);
                return;
            }
            var updateFocusLevel;
            this.focusNode(node, selectionMode, updateFocusLevel = true);
        };
        NestedNodeDocument.prototype.focusParentNode = function () {
            var updateFocusLevel;
            this.focusNode(this.focusedNode.parent, 0 /* Reset */, updateFocusLevel = true);
        };
        NestedNodeDocument.prototype.focusNestedNode = function () {
            var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
            var updateFocusLevel;
            this.focusNode(nested, 0 /* Reset */, updateFocusLevel = true);
        };
        NestedNodeDocument.prototype.focusPrevNode = function (selectionMode) {
            this.focusSiblingNode(Direction.getBackward(), selectionMode);
        };
        NestedNodeDocument.prototype.focusNextNode = function (selectionMode) {
            this.focusSiblingNode(Direction.getForward(), selectionMode);
        };
        NestedNodeDocument.prototype.focusSiblingNode = function (direction, selectionMode) {
            if ([0 /* Reset */, 2 /* Shift */].indexOf(selectionMode) == -1) {
                throw new Error('Unsupported SelectionMode for this operation :' + selectionMode);
            }
            var sibling;
            var sameParentOnly;
            var updateFocusLevel;
            if (selectionMode == 2 /* Shift */) {
                sibling = this.focusedNode.getSibling(direction, sameParentOnly = true);
                this.focusNode(sibling, 2 /* Shift */, updateFocusLevel = true);
            }
            else {
                sibling = this.focusedNode.getSibling(direction, sameParentOnly = false, this.currentFocusLevel);
                this.focusNode(sibling, 0 /* Reset */, updateFocusLevel = false);
            }
        };
        NestedNodeDocument.prototype.focusNode = function (node, selectionMode, updateFocusLevel) {
            var _this = this;
            if (selectionMode === void 0) { selectionMode = 0 /* Reset */; }
            if (updateFocusLevel === void 0) { updateFocusLevel = true; }
            if (!node) {
                return;
            }
            var nodeToFocus = (function () {
                switch (selectionMode) {
                    case 0 /* Reset */: return SelectionHelper.resetSelectionToNode(node);
                    case 1 /* Toggle */: return SelectionHelper.toggleSelectionWithNode(node);
                    case 2 /* Shift */: return SelectionHelper.shiftSelectionToNode(_this.focusedNode, node);
                    default: throw new Error('Unknown SelectionMode: ' + selectionMode);
                }
            })();
            this.setFocusedNode(nodeToFocus, updateFocusLevel);
            this.emit('focusChange', this.focusedNode.id);
        };
        NestedNodeDocument.prototype.setFocusedNode = function (node, updateFocusLevel) {
            this.focusedNode = node;
            if (node.hasParent) {
                this.previouslyFocusedNested.set(node.parent, node);
            }
            if (updateFocusLevel) {
                this.currentFocusLevel = this.focusedNode.level;
            }
        };
        // ** Modification Actions
        NestedNodeDocument.prototype.insertNewNode = function () {
            var newNode = new NestedNode(this, this.getBlankNodeData(), this.nodeDataDuplicator);
            this.executeCommand(new AppendCommand([newNode], this.focusedNode));
        };
        NestedNodeDocument.prototype.removeNode = function () {
            this.executeCommand(new RemoveCommand(this.root.getSelection()));
        };
        NestedNodeDocument.prototype.executeCommand = function (cmd) {
            this.root.unselectDeep();
            this.setFocusedNode(cmd.execute(), true);
            this.emit('contentChange', this.content);
        };
        return NestedNodeDocument;
    })(EventEmitter);
    return NestedNodeDocument;
});
