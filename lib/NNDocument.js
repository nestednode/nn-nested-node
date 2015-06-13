var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/Collection/Collection', 'pkg/EventEmitter/EventEmitter', 'pkg/NestedNodeProps/lib/SelectionMode', './NestedNode', './Direction', './SelectionHelper', './CommandHistory', './Command/UpdateDataCommand', './Command/AppendCommand', './Command/EnvelopeCommand', './Command/RemoveCommand', './Command/RearrangeCommand', './Command/CompositeCommand'], function (require, exports, Collection, EventEmitter, SelectionMode, NestedNode, Direction, SelectionHelper, CommandHistory, UpdateDataCommand, AppendCommand, EnvelopeCommand, RemoveCommand, RearrangeCommand, CompositeCommand) {
    /*abstract*/ var NNDocument = (function (_super) {
        __extends(NNDocument, _super);
        // * Constructing
        function NNDocument(content, clipboardProvider) {
            var _this = this;
            _super.call(this);
            this.nodeRegistryCounter = 0;
            this.id = 'doc'; //todo something
            this.nodeRegistry = new Collection.Map();
            this.history = new CommandHistory();
            this.previouslyFocusedMap = new Collection.Map();
            this.root = new NestedNode(this, { data: null }, function (d) { return d; });
            var topNode = this.createNode(content).appendToParent(this.root).select();
            this.setFocusedNode(topNode);
            //this._editMode = false;
            this.clipboard = clipboardProvider || new LocalClipboardProvider();
            this.addListener('focusChange', function () { return _this.emit('change', _this); });
        }
        Object.defineProperty(NNDocument.prototype, "node", {
            // фактический узел документа, таким образом, не root, а его первый (и единственный) nested
            get: function () {
                return this.root.firstNested;
            },
            enumerable: true,
            configurable: true
        });
        // * Abstract Node Data methods
        /*abstract*/
        NNDocument.prototype.getBlankNodeData = function () {
            throw new Error('abstract method');
        };
        /*abstract*/
        NNDocument.prototype.nodeDataDuplicator = function (data) {
            throw new Error('abstract method');
        };
        /*abstract*/
        NNDocument.prototype.nodeDataEqualityChecker = function (data1, data2) {
            throw new Error('abstract method');
        };
        // *
        NNDocument.prototype.createNode = function (props) {
            props = props || { data: this.getBlankNodeData() };
            return new NestedNode(this, props, this.nodeDataDuplicator);
        };
        NNDocument.prototype.isBlankNode = function (node) {
            if (node.nestedCount != 0) {
                return false;
            }
            return this.nodeDataEqualityChecker(this.getBlankNodeData(), node.data);
        };
        NNDocument.prototype.registerItem = function (node) {
            //todo check if node not already registred
            var nodeId = this.id + '-' + this.nodeRegistryCounter++;
            this.nodeRegistry.set(nodeId, node);
            return nodeId;
        };
        NNDocument.prototype.unregisterItem = function (node) {
            this.nodeRegistry.delete(node.id);
            //todo cleanup previouslyFocusedMap
        };
        NNDocument.prototype.getItemById = function (id) {
            return this.nodeRegistry.get(id);
        };
        NNDocument.prototype.focusNodeById = function (id, selectionMode) {
            var node = this.getItemById(id);
            if (!node) {
                console.warn('No node found with id: ' + id);
                return;
            }
            this.focusNode(node, selectionMode);
        };
        NNDocument.prototype.focusParentNode = function () {
            if (this.focusedNode.isTopLevel) {
                return;
            }
            this.focusNode(this.focusedNode.parent, 0 /* Reset */);
        };
        NNDocument.prototype.focusNestedNode = function () {
            var nested = this.getPreviouslyFocusedNested(this.focusedNode) || this.focusedNode.firstNested;
            this.focusNode(nested, 0 /* Reset */);
        };
        NNDocument.prototype.getPreviouslyFocusedNested = function (parentNode) {
            var nestedNode = this.previouslyFocusedMap.get(parentNode);
            if (nestedNode && (!nestedNode.hasParent || nestedNode.parent !== parentNode)) {
                // неактуальное значение в кеше, удаляем его
                this.previouslyFocusedMap.delete(parentNode);
                return null;
            }
            return nestedNode;
        };
        NNDocument.prototype.focusPrevNode = function (selectionMode) {
            this.focusSiblingNode(Direction.getBackward(), selectionMode);
        };
        NNDocument.prototype.focusNextNode = function (selectionMode) {
            this.focusSiblingNode(Direction.getForward(), selectionMode);
        };
        NNDocument.prototype.selectNodeSiblings = function () {
            this.setFocusedNode(SelectionHelper.extendSelectionToNodeSiblings(this.focusedNode));
            this.emit('focusChange', this.focusedNode.id);
        };
        NNDocument.prototype.focusSiblingNode = function (direction, selectionMode) {
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
        NNDocument.prototype.focusNode = function (node, selectionMode, updateFocusLevel) {
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
        NNDocument.prototype.setFocusedNode = function (node, updateFocusLevel) {
            if (updateFocusLevel === void 0) { updateFocusLevel = true; }
            if (!node.hasParent) {
                throw new Error('parentless node not allowed to be focused');
            }
            this.focusedNode && this.focusedNode.unfocus();
            this.focusedNode = node.focus();
            this.previouslyFocusedMap.set(node.parent, node);
            if (updateFocusLevel) {
                this.currentFocusLevel = this.focusedNode.level;
            }
        };
        Object.defineProperty(NNDocument.prototype, "editMode", {
            get: function () {
                return !!this._editMode;
            },
            enumerable: true,
            configurable: true
        });
        NNDocument.prototype.enterEditMode = function (clearCurrentValue, emitModeChange) {
            if (clearCurrentValue === void 0) { clearCurrentValue = false; }
            if (emitModeChange === void 0) { emitModeChange = true; }
            if (this._editMode) {
                console.warn('already in edit mode');
                return;
            }
            this._editMode = true;
            SelectionHelper.resetSelectionToNode(this.focusedNode);
            this.nodeDataSnapshot = this.nodeDataDuplicator(this.focusedNode.data);
            if (clearCurrentValue) {
                this.focusedNode.data = this.getBlankNodeData();
            }
            emitModeChange && this.emit('change', this);
        };
        NNDocument.prototype.updateNodeData = function (newData) {
            if (this._editMode) {
                this.focusedNode.data = newData;
                this.emit('change', this);
            }
            else {
                var emitModeChange, clearCurrentValue, undoChanges;
                this.enterEditMode(clearCurrentValue = false, emitModeChange = false);
                this.focusedNode.data = newData;
                this.exitEditMode(undoChanges = false, emitModeChange = false);
            }
        };
        NNDocument.prototype.exitEditMode = function (undoChanges, emitModeChange) {
            if (undoChanges === void 0) { undoChanges = false; }
            if (emitModeChange === void 0) { emitModeChange = true; }
            if (!this._editMode) {
                console.warn('already in normal mode');
                return;
            }
            this._editMode = false;
            var dataEqual = this.nodeDataEqualityChecker(this.nodeDataSnapshot, this.focusedNode.data);
            if (dataEqual) {
                // все равно возвращаем узлу исходные данные
                // т.к. equalityChecker может не учитывать whitespace при сравнении
                this.focusedNode.data = this.nodeDataSnapshot;
                emitModeChange && this.emit('change', this);
                return;
            }
            var command = new UpdateDataCommand(this.focusedNode, this.nodeDataSnapshot, this.focusedNode.data);
            if (undoChanges) {
                var emitChange;
                this.executeCommand(command, emitChange = false);
                this.undo();
            }
            else {
                this.executeCommand(command);
            }
        };
        // ** Structure Modification Actions
        NNDocument.prototype.insertNewNode = function () {
            this.executeCommand(new AppendCommand([this.createNode()], this.focusedNode));
        };
        NNDocument.prototype.appendNewNodeBefore = function () {
            this.appendNewNode(Direction.getBackward());
        };
        NNDocument.prototype.appendNewNodeAfter = function () {
            this.appendNewNode(Direction.getForward());
        };
        NNDocument.prototype.appendNewNode = function (direction) {
            var parentNode;
            var command;
            var nodesToAppend = [this.createNode()];
            if (this.focusedNode.isTopLevel) {
                // topLevel-узел может быть только один, поэтому добавляем внутрь него, а не рядом
                parentNode = this.focusedNode;
                var aheadNode = direction.isBackward ? this.focusedNode.firstNested : null;
                command = new AppendCommand(nodesToAppend, parentNode, aheadNode);
            }
            else {
                parentNode = this.focusedNode.parent;
                var anchorNode = this.focusedNode;
                command = new AppendCommand(nodesToAppend, parentNode, anchorNode, direction);
            }
            this.executeCommand(command);
        };
        NNDocument.prototype.duplicateNode = function () {
            //todo
        };
        NNDocument.prototype.envelopeNode = function () {
            var selection = SelectionHelper.getSelectionNearNode(this.focusedNode);
            this.executeCommand(new EnvelopeCommand(selection, this.createNode()));
        };
        NNDocument.prototype.removeNode = function () {
            var command;
            var removeCommand = new RemoveCommand(this.root.getSelection());
            if (this.focusedNode.isTopLevel) {
                // нельзя остаться вообще без topLevel-узла, поэтому просто заменяем его пустым
                if (this.isBlankNode(this.focusedNode)) {
                    //но если узел и так уже blank, не засоряем history лишними операциями
                    return;
                }
                command = new CompositeCommand([
                    removeCommand,
                    new AppendCommand([this.createNode()], this.root)
                ]);
            }
            else {
                command = removeCommand;
            }
            this.executeCommand(command);
        };
        NNDocument.prototype.moveNodeForward = function () {
            this.rearrangeNode(Direction.getForward());
        };
        NNDocument.prototype.moveNodeBackward = function () {
            this.rearrangeNode(Direction.getBackward());
        };
        NNDocument.prototype.rearrangeNode = function (direction) {
            var nodesToRearrange = SelectionHelper.getSelectionNearNode(this.focusedNode);
            if (!RearrangeCommand.canExecute(nodesToRearrange, direction)) {
                return;
            }
            this.executeCommand(new RearrangeCommand(nodesToRearrange, direction));
        };
        NNDocument.prototype.copyToClipboard = function () {
            var _this = this;
            var nodesProps = this.root.getSelection().map(function (node) { return node.cloneProps(_this.nodeDataDuplicator); });
            this.clipboard.set(nodesProps);
        };
        NNDocument.prototype.cutToClipboard = function () {
            this.copyToClipboard();
            this.removeNode();
        };
        NNDocument.prototype.pasteFromClipboard = function () {
            var _this = this;
            var nodesProps = this.clipboard.get();
            if (!nodesProps) {
                return;
            }
            var nodesToPaste = nodesProps.map(function (props) { return _this.createNode(props); });
            var command;
            var parentNode;
            if (this.isBlankNode(this.focusedNode)) {
                // при вставке в пустой узел, просто заменяем его содержимым
                parentNode = this.focusedNode.parent;
                var aheadNode = this.focusedNode.getSibling();
                command = new CompositeCommand([
                    new RemoveCommand([this.focusedNode]),
                    new AppendCommand(nodesToPaste, parentNode, aheadNode)
                ]);
            }
            else {
                parentNode = this.focusedNode;
                command = new AppendCommand(nodesToPaste, parentNode);
            }
            this.executeCommand(command);
        };
        NNDocument.prototype.executeCommand = function (cmd, emitChange) {
            if (emitChange === void 0) { emitChange = true; }
            this.root.unselectDeep();
            var nextFocusedNode = cmd.execute();
            this.history.push(cmd);
            this.setFocusedNode(nextFocusedNode);
            emitChange && this.emit('change', this);
        };
        NNDocument.prototype.undo = function () {
            this.stepHistory(Direction.getBackward());
        };
        NNDocument.prototype.redo = function () {
            this.stepHistory(Direction.getForward());
        };
        NNDocument.prototype.stepHistory = function (direction) {
            if (!this.history.canStepTo(direction)) {
                return;
            }
            this.root.unselectDeep();
            var nodeToFocus = this.history.stepTo(direction);
            this.setFocusedNode(nodeToFocus);
            this.emit('change', this);
        };
        return NNDocument;
    })(EventEmitter);
    var LocalClipboardProvider = (function () {
        function LocalClipboardProvider() {
        }
        LocalClipboardProvider.prototype.get = function () {
            return this.clipboardContent;
        };
        LocalClipboardProvider.prototype.set = function (content) {
            this.clipboardContent = content;
        };
        return LocalClipboardProvider;
    })();
    return NNDocument;
});
