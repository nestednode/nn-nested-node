var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/Collection/Collection', 'pkg/EventEmitter/EventEmitter', './NestedNode', './Direction', './SelectionMode', './SelectionHelper', './Command/CommandHistory', './Command/AppendCommand', './Command/RemoveCommand', './Command/ReplaceRootCommand', './Command/RearrangeCommand'], function (require, exports, Collection, EventEmitter, NestedNode, Direction, SelectionMode, SelectionHelper, CommandHistory, AppendCommand, RemoveCommand, ReplaceRootCommand, RearrangeCommand) {
    var NestedNodeDocument = (function (_super) {
        __extends(NestedNodeDocument, _super);
        // * Constructing
        function NestedNodeDocument(data) {
            var _this = this;
            _super.call(this);
            this.nodeRegistryCounter = 0;
            this.id = 'doc'; //todo something
            this.nodeRegistry = new Collection.Map();
            this.history = new CommandHistory();
            this.previouslyFocusedNested = new Collection.Map();
            this.root = new NestedNode(this, data, this.nodeDataDuplicator);
            this.focusNode(this.root);
            this.addListener('focusChange', function () { return _this.emit('change'); });
        }
        Object.defineProperty(NestedNodeDocument.prototype, "data", {
            get: function () {
                return this.root.data;
            },
            enumerable: true,
            configurable: true
        });
        //internal
        NestedNodeDocument.prototype.replaceRoot = function (newRoot) {
            var oldRoot = this.root;
            this.root = newRoot;
            return oldRoot;
        };
        // * Abstract Node Data methods
        NestedNodeDocument.prototype.getBlankNodeData = function () {
            throw new Error('abstract method');
        };
        // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
        NestedNodeDocument.prototype.nodeDataDuplicator = function (data) {
            throw new Error('abstract method');
        };
        NestedNodeDocument.prototype.createBlankNode = function () {
            return new NestedNode(this, this.getBlankNodeData(), this.nodeDataDuplicator);
        };
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
        NestedNodeDocument.prototype.focusNodeById = function (id, selectionMode) {
            var node = this.getNodeById(id);
            if (!node) {
                console.warn('No node found with id: ' + id);
                return;
            }
            this.focusNode(node, selectionMode);
        };
        NestedNodeDocument.prototype.focusParentNode = function () {
            this.focusNode(this.focusedNode.parent, 0 /* Reset */);
        };
        NestedNodeDocument.prototype.focusNestedNode = function () {
            var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
            this.focusNode(nested, 0 /* Reset */);
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
            if (!this.focusedNode.hasParent) {
                return;
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
            if (updateFocusLevel === void 0) { updateFocusLevel = true; }
            this.focusedNode = node;
            if (node.hasParent) {
                this.previouslyFocusedNested.set(node.parent, node);
            }
            if (updateFocusLevel) {
                this.currentFocusLevel = this.focusedNode.level;
            }
        };
        NestedNodeDocument.prototype.insertNewNode = function () {
            this.executeCommand(new AppendCommand([this.createBlankNode()], this.focusedNode));
        };
        NestedNodeDocument.prototype.appendNewNodeBefore = function () {
            this.appendNewNode(Direction.getBackward());
        };
        NestedNodeDocument.prototype.appendNewNodeAfter = function () {
            this.appendNewNode(Direction.getForward());
        };
        NestedNodeDocument.prototype.appendNewNode = function (direction) {
            var parentNode;
            var anchorNode;
            if (this.focusedNode.hasParent) {
                parentNode = this.focusedNode.parent;
                anchorNode = this.focusedNode;
            }
            else {
                parentNode = this.focusedNode;
                anchorNode = direction.isForward ? this.focusedNode.lastNested : this.focusedNode.firstNested;
            }
            var cmd = new AppendCommand([this.createBlankNode()], parentNode, anchorNode, direction);
            this.executeCommand(cmd);
        };
        NestedNodeDocument.prototype.removeNode = function () {
            if (!this.focusedNode.hasParent) {
                // можно было бы просто не давать перевести фокус на root,
                // тогда бы и не потребовались специальные операции над корневым,
                // но пока что хочу, чтобы в интерфейсе root присутствовал явно и был только один
                this.executeCommand(new ReplaceRootCommand(this, this.createBlankNode()));
                return;
            }
            this.executeCommand(new RemoveCommand(this.root.getSelection()));
        };
        NestedNodeDocument.prototype.moveNodeForward = function () {
            this.rearrangeNode(Direction.getForward());
        };
        NestedNodeDocument.prototype.moveNodeBackward = function () {
            this.rearrangeNode(Direction.getBackward());
        };
        NestedNodeDocument.prototype.rearrangeNode = function (direction) {
            if (!this.focusedNode.hasParent) {
                return;
            }
            var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
            // вместо сдвига каждого узла в selection,
            // приводим это действие к перестановке через selection соседствующего узла;
            // вообще, это уже внутреннее дело команды, как ей там действовать,
            // и я бы перенес это код туда,
            // но тогда интерфейс команд должен быть дополнен методом canExecute,
            // который бы проверял наличие nodeToRearrange
            var boundaryIndex = direction.isForward ? selection.length - 1 : 0;
            var nodeToRearrange = selection[boundaryIndex].getSibling(direction);
            if (!nodeToRearrange) {
                return;
            }
            this.executeCommand(new RearrangeCommand(nodeToRearrange, selection, direction));
        };
        NestedNodeDocument.prototype.executeCommand = function (cmd) {
            this.root.unselectDeep();
            var nextFocusedNode = cmd.execute();
            this.history.push(cmd);
            this.setFocusedNode(nextFocusedNode);
            this.emit('change', this.data);
        };
        // *** Undo / Redo Actions
        NestedNodeDocument.prototype.undo = function () {
            this.stepHistory(Direction.getBackward());
        };
        NestedNodeDocument.prototype.redo = function () {
            this.stepHistory(Direction.getForward());
        };
        NestedNodeDocument.prototype.stepHistory = function (direction) {
            if (!this.history.canStepTo(direction)) {
                return;
            }
            this.root.unselectDeep();
            this.setFocusedNode(this.history.stepTo(direction));
            this.emit('change', this.data);
        };
        return NestedNodeDocument;
    })(EventEmitter);
    return NestedNodeDocument;
});
