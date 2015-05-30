var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './SelectionMode', 'pkg/React/React'], function (require, exports, SelectionMode, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    var DocumentViewContext = (function () {
        function DocumentViewContext(documentActions, editMode) {
            if (documentActions === void 0) { documentActions = React.PropTypes.any; }
            if (editMode === void 0) { editMode = React.PropTypes.any; }
            this.documentActions = documentActions;
            this.editMode = editMode;
        }
        return DocumentViewContext;
    })();
    exports.DocumentViewContext = DocumentViewContext;
    // * Components
    //export var NestedTextNodeViewElem: React.ReactElementFactory<NodeViewProps<TextData>>;
    var NodeViewComp = (function (_super) {
        __extends(NodeViewComp, _super);
        function NodeViewComp() {
            _super.apply(this, arguments);
        }
        NodeViewComp.prototype.render = function () {
            var _this = this;
            var node = this.props.node;
            return (dom['div']({ className: 'nn_node' }, dom['div']({
                className: 'nn_text' + (node.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, this.renderData(node.data)), dom['div']({ className: 'nn_nested' }, node.nested ? node.nested.map(function (nestedNode) { return _this.createElement({ node: nestedNode, key: nestedNode.id }); }) : false)));
        };
        NodeViewComp.prototype.createElement = function (props) {
            throw new Error('abstract method');
        };
        NodeViewComp.prototype.renderData = function (data) {
            throw new Error('abstract method');
        };
        NodeViewComp.prototype.handleClick = function (e) {
            var actions = this.context.documentActions;
            var selectionMode = e.metaKey ? 1 /* Toggle */ : e.shiftKey ? 2 /* Shift */ : 0 /* Reset */;
            actions && actions.focusNodeById(this.props.node.id, selectionMode);
        };
        //static factory = React.createFactory<NodeViewProps<D>>(NodeViewComp);
        // без этой декларации this.context будет пустым
        NodeViewComp.contextTypes = new DocumentViewContext();
        return NodeViewComp;
    })(React.Component);
    exports.NodeViewComp = NodeViewComp;
    //NestedTextNodeViewElem = React.createFactory<NodeViewProps>(NodeViewComp);
    var DocumentViewComp = (function (_super) {
        __extends(DocumentViewComp, _super);
        function DocumentViewComp(props) {
            _super.call(this, props);
            this.state = {
                focused: false
            };
        }
        DocumentViewComp.prototype.getChildContext = function () {
            return new DocumentViewContext(this.props.documentActions, this.props.editMode);
        };
        DocumentViewComp.prototype.render = function () {
            return (dom['div']({
                tabIndex: 1,
                className: 'nn_ctx' + (this.state.focused ? ' focused' : ''),
                onKeyDown: this.handleKeyDown.bind(this),
                onFocus: this.handleFocus.bind(this),
                onBlur: this.handleBlur.bind(this)
            }, this.props.nodeViewFactory({ node: this.props.node })));
        };
        DocumentViewComp.prototype.handleKeyDown = function (e) {
            var actions = this.props.documentActions;
            if (!actions) {
                return;
            }
            //todo something
            var keyCode = {
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                TAB: 9,
                RETURN: 13,
                DELETE: 46,
                X: 88,
                C: 67,
                V: 86,
                Z: 90,
                Y: 89,
                SPACE: 32,
                ESCAPE: 27
            };
            var code = e.keyCode;
            var eventHandled = (function () {
                switch (true) {
                    case code == keyCode.SPACE:
                        actions.enterEditMode();
                        return true;
                    case code == keyCode.ESCAPE:
                        actions.exitEditMode();
                        return true;
                    case code == keyCode.LEFT && e.altKey:
                    case code == keyCode.LEFT && e.shiftKey:
                        return false;
                    case code == keyCode.LEFT:
                        actions.focusParentNode();
                        return true;
                    case code == keyCode.RIGHT && e.altKey:
                    case code == keyCode.RIGHT && e.shiftKey:
                        return false;
                    case code == keyCode.RIGHT:
                        actions.focusNestedNode();
                        return true;
                    case code == keyCode.UP && e.altKey:
                        actions.moveNodeBackward();
                        return true;
                    case code == keyCode.UP && e.shiftKey:
                        actions.focusPrevNode(2 /* Shift */);
                        return true;
                    case code == keyCode.UP:
                        actions.focusPrevNode(0 /* Reset */);
                        return true;
                    case code == keyCode.DOWN && e.altKey:
                        actions.moveNodeForward();
                        return true;
                    case code == keyCode.DOWN && e.shiftKey:
                        actions.focusNextNode(2 /* Shift */);
                        return true;
                    case code == keyCode.DOWN:
                        actions.focusNextNode(0 /* Reset */);
                        return true;
                    case code == keyCode.TAB && e.shiftKey:
                        actions.envelopeNode();
                        return true;
                    case code == keyCode.TAB:
                        actions.insertNewNode();
                        return true;
                    case code == keyCode.RETURN && e.shiftKey:
                        actions.appendNewNodeBefore();
                        return true;
                    case code == keyCode.RETURN:
                        actions.appendNewNodeAfter();
                        return true;
                    case code == keyCode.DELETE:
                        actions.removeNode();
                        return true;
                    case code == keyCode.C && e.metaKey:
                        actions.copyToClipboard();
                        return true;
                    case code == keyCode.X && e.metaKey:
                        actions.cutToClipboard();
                        return true;
                    case code == keyCode.V && e.metaKey:
                        actions.pasteFromClipboard();
                        return true;
                    case code == keyCode.Z && e.metaKey:
                        actions.undo();
                        return true;
                    case code == keyCode.Y && e.metaKey:
                        actions.redo();
                        return true;
                }
            })();
            if (eventHandled) {
                e.preventDefault();
            }
        };
        DocumentViewComp.prototype.handleFocus = function (e) {
            this.setState({ focused: true });
        };
        DocumentViewComp.prototype.handleBlur = function (e) {
            this.setState({ focused: false });
        };
        // без этой декларации getChildContext() бросит исключение
        DocumentViewComp.childContextTypes = new DocumentViewContext();
        return DocumentViewComp;
    })(React.Component);
    exports.DocumentViewComp = DocumentViewComp;
    function DocumentView(props) {
        return React.createElement(DocumentViewComp, props);
    }
    exports.DocumentView = DocumentView;
});
