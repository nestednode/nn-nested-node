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
            var data = this.props.nodeData;
            var owner = data.owner;
            return (dom['div']({ className: 'nn_node' }, dom['div']({
                className: 'nn_text' + (owner && owner.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, data.text), dom['div']({ className: 'nn_nested' }, data.nested ? data.nested.map(function (nestedData, key) { return exports.NestedTextElem({ nodeData: nestedData, key: key }); }) : false)));
        };
        NestedTextComp.prototype.handleClick = function (e) {
            var actions = this.context.documentActions;
            var owner = this.props.nodeData.owner;
            var selectionMode = e.metaKey ? 1 /* Toggle */ : e.shiftKey ? 2 /* Shift */ : 0 /* Reset */;
            actions && owner && actions.focusNodeById(owner.id, selectionMode);
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
            }, exports.NestedTextElem({ nodeData: this.props.nodeData })));
        };
        NestedTextDocumentComp.prototype.componentDidMount = function () {
            //var domNode = React.findDOMNode(this);
            //domNode.addEventListener('keydown', this.handleKeyDown.bind(this));
        };
        //todo unmount
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
                DELETE: 46
            };
            var code = e.keyCode;
            switch (true) {
                case code == keyCode.LEFT && e.shiftKey:
                    break;
                case code == keyCode.LEFT:
                    actions.focusParentNode();
                    break;
                case code == keyCode.RIGHT && e.shiftKey:
                    break;
                case code == keyCode.RIGHT:
                    actions.focusNestedNode();
                    break;
                case code == keyCode.UP && e.shiftKey:
                    actions.focusPrevNode(2 /* Shift */);
                    break;
                case code == keyCode.UP:
                    actions.focusPrevNode(0 /* Reset */);
                    break;
                case code == keyCode.DOWN && e.shiftKey:
                    actions.focusNextNode(2 /* Shift */);
                    break;
                case code == keyCode.DOWN:
                    actions.focusNextNode(0 /* Reset */);
                    break;
                case code == keyCode.TAB:
                    actions.insertNewNode();
                    e.preventDefault();
                    break;
                case code == keyCode.DELETE:
                    actions.removeNode();
                    break;
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
