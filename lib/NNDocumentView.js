var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './NestedNodeView', './SelectionMode', 'pkg/React/React'], function (require, exports, NestedNodeView, SelectionMode, React) {
    var dom = React.DOM;
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component(props) {
            _super.call(this, props);
            this.state = {
                focused: false
            };
        }
        Component.prototype.getChildContext = function () {
            return new NestedNodeView.Context(this.props.documentActions, this.props.documentProps);
        };
        Component.prototype.render = function () {
            return (dom['div']({
                tabIndex: 1,
                className: 'nn_ctx' + (this.state.focused ? ' focused' : ''),
                onKeyDown: this.handleKeyDown.bind(this),
                onFocus: this.handleFocus.bind(this),
                onBlur: this.handleBlur.bind(this)
            }, this.props.nodeViewFactory({ node: this.props.documentProps.node })));
        };
        Component.prototype.handleKeyDown = function (e) {
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
        Component.prototype.handleFocus = function (e) {
            this.setState({ focused: true });
        };
        Component.prototype.handleBlur = function (e) {
            this.setState({ focused: false });
        };
        // без этой декларации getChildContext() бросит исключение
        Component.childContextTypes = new NestedNodeView.Context();
        return Component;
    })(React.Component);
    exports.Component = Component;
    function Element(props) {
        return React.createElement(Component, props);
    }
    exports.Element = Element;
});
