var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './SelectionMode', 'pkg/React/React'], function (require, exports, SelectionMode, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    var DocumentContext = (function () {
        function DocumentContext(documentActions) {
            if (documentActions === void 0) { documentActions = React.PropTypes.any; }
            this.documentActions = documentActions;
        }
        return DocumentContext;
    })();
    exports.DocumentContext = DocumentContext;
    // * Components
    exports.NestedTextElem;
    var NestedTextComp = (function (_super) {
        __extends(NestedTextComp, _super);
        function NestedTextComp() {
            _super.apply(this, arguments);
        }
        NestedTextComp.prototype.render = function () {
            var node = this.props.node;
            return (dom['div']({ className: 'nn_node' }, dom['div']({
                className: 'nn_text' + (node.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, node.data.text + (node.editing ? '*' : '')), dom['div']({ className: 'nn_nested' }, node.nested ? node.nested.map(function (nestedNode) { return exports.NestedTextElem({ node: nestedNode, key: nestedNode.id }); }) : false)));
        };
        NestedTextComp.prototype.handleClick = function (e) {
            var actions = this.context.documentActions;
            var selectionMode = e.metaKey ? 1 /* Toggle */ : e.shiftKey ? 2 /* Shift */ : 0 /* Reset */;
            actions && actions.focusNodeById(this.props.node.id, selectionMode);
        };
        // без этой декларации this.context будет пустым
        NestedTextComp.contextTypes = new DocumentContext();
        return NestedTextComp;
    })(React.Component);
    exports.NestedTextElem = React.createFactory(NestedTextComp);
    var NestedTextDocumentComp = (function (_super) {
        __extends(NestedTextDocumentComp, _super);
        function NestedTextDocumentComp(props) {
            _super.call(this, props);
            this.state = {
                focused: false
            };
        }
        NestedTextDocumentComp.prototype.getChildContext = function () {
            return new DocumentContext(this.props.documentActions);
        };
        NestedTextDocumentComp.prototype.render = function () {
            return (dom['div']({
                tabIndex: 1,
                className: 'nn_ctx' + (this.state.focused ? ' focused' : ''),
                onKeyDown: this.handleKeyDown.bind(this),
                onFocus: this.handleFocus.bind(this),
                onBlur: this.handleBlur.bind(this)
            }, exports.NestedTextElem({ node: this.props.node })));
        };
        NestedTextDocumentComp.prototype.handleKeyDown = function (e) {
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
                Y: 89
            };
            var code = e.keyCode;
            var eventHandled = (function () {
                switch (true) {
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
        NestedTextDocumentComp.prototype.handleFocus = function (e) {
            this.setState({ focused: true });
        };
        NestedTextDocumentComp.prototype.handleBlur = function (e) {
            this.setState({ focused: false });
        };
        // без этой декларации getChildContext() бросит исключение
        NestedTextDocumentComp.childContextTypes = new DocumentContext();
        return NestedTextDocumentComp;
    })(React.Component);
    exports.NestedTextDocumentElem = React.createFactory(NestedTextDocumentComp);
});
