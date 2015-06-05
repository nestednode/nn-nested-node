var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './NestedNodeView', './SelectionMode', './KeyboardUtil', 'pkg/React/React'], function (require, exports, NestedNodeView, SelectionMode, KeyboardUtil, React) {
    var KeyCode = KeyboardUtil.KeyCode;
    var dom = React.DOM;
    var NNDocumentView;
    (function (NNDocumentView) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(props, context) {
                _super.call(this, props, context);
                this.handleKeyDown = this.handleKeyDown.bind(this);
                this.handleFocus = this.handleFocus.bind(this);
                this.handleBlur = this.handleBlur.bind(this);
            }
            Component.prototype.getChildContext = function () {
                return new NestedNodeView.Context(this.props.documentActions, this.props.documentProps);
            };
            Component.prototype.render = function () {
                var node = this.props.documentProps.node;
                return (dom['div']({ className: 'nn_document_scrollbox' }, dom['div']({ className: 'nn_document_container' }, dom['div']({
                    //tabIndex: 0,
                    className: 'nn_document',
                    onKeyDown: this.handleKeyDown,
                    onFocus: this.handleFocus,
                    onBlur: this.handleBlur
                }, React.createElement(this.props.nestedNodeViewComponent, {
                    node: node,
                    focused: node.focused,
                    editing: this.props.documentProps.editMode && node.focused
                })))));
            };
            Component.prototype.handleKeyDown = function (e) {
                var actions = this.props.documentActions;
                var editMode = this.props.documentProps.editMode;
                var shortcut = new KeyboardUtil.Shortcut(e);
                var eventHandled = (function () {
                    switch (true) {
                        case editMode && shortcut.eq(KeyCode.ESCAPE):
                            var undoChanges;
                            actions.exitEditMode(undoChanges = true);
                            return true;
                        case editMode && shortcut.eq(KeyCode.RETURN):
                            actions.exitEditMode();
                            return true;
                        case editMode:
                            return false;
                        case shortcut.eq(KeyCode.F2):
                            actions.enterEditMode();
                            return true;
                        case shortcut.eq(KeyCode.LEFT):
                            actions.focusParentNode();
                            return true;
                        case shortcut.eq(KeyCode.RIGHT):
                            actions.focusNestedNode();
                            return true;
                        case shortcut.eq(KeyCode.UP):
                            actions.focusPrevNode(0 /* Reset */);
                            return true;
                        case shortcut.eq(KeyCode.UP, 'shiftKey'):
                            actions.focusPrevNode(2 /* Shift */);
                            return true;
                        case shortcut.eq(KeyCode.DOWN):
                            actions.focusNextNode(0 /* Reset */);
                            return true;
                        case shortcut.eq(KeyCode.DOWN, 'shiftKey'):
                            actions.focusNextNode(2 /* Shift */);
                            return true;
                        case shortcut.eq(KeyCode.TAB):
                            actions.insertNewNode();
                            return true;
                        case shortcut.eq(KeyCode.TAB, 'shiftKey'):
                            actions.envelopeNode();
                            return true;
                        case shortcut.eq(KeyCode.RETURN):
                            actions.appendNewNodeAfter();
                            return true;
                        case shortcut.eq(KeyCode.RETURN, 'shiftKey'):
                            actions.appendNewNodeBefore();
                            return true;
                        case shortcut.eq(KeyCode.UP, 'altKey'):
                            actions.moveNodeBackward();
                            return true;
                        case shortcut.eq(KeyCode.DOWN, 'altKey'):
                            actions.moveNodeForward();
                            return true;
                        case shortcut.eq(KeyCode.DELETE):
                            actions.removeNode();
                            return true;
                        case shortcut.eq(KeyCode.C, 'metaKey'):
                            actions.copyToClipboard();
                            return true;
                        case shortcut.eq(KeyCode.X, 'metaKey'):
                            actions.cutToClipboard();
                            return true;
                        case shortcut.eq(KeyCode.V, 'metaKey'):
                            actions.pasteFromClipboard();
                            return true;
                        case shortcut.eq(KeyCode.Z, 'metaKey'):
                            actions.undo();
                            return true;
                        case shortcut.eq(KeyCode.Z, 'metaKey', 'shiftKey'):
                        case shortcut.eq(KeyCode.Y, 'metaKey'):
                            actions.redo();
                            return true;
                        default:
                            return false;
                    }
                })();
                if (eventHandled) {
                    e.preventDefault();
                }
            };
            Component.prototype.handleFocus = function () {
                var domNode = React.findDOMNode(this);
                domNode.classList.add('focused');
            };
            Component.prototype.handleBlur = function () {
                var domNode = React.findDOMNode(this);
                domNode.classList.remove('focused');
            };
            // без этой декларации getChildContext() бросит исключение
            Component.childContextTypes = new NestedNodeView.Context();
            return Component;
        })(React.Component);
        NNDocumentView.Component = Component;
        function Element(props) {
            return React.createElement(Component, props);
        }
        NNDocumentView.Element = Element;
    })(NNDocumentView || (NNDocumentView = {}));
    return NNDocumentView;
});
