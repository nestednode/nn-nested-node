var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/React/React'], function (require, exports, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    exports.NestedTextElem = React.createFactory(NestedTextComp);
    exports.NestedTextDocumentElem = React.createFactory(NestedTextDocumentComp);
    var NestedTextComp = (function (_super) {
        __extends(NestedTextComp, _super);
        function NestedTextComp() {
            _super.apply(this, arguments);
        }
        NestedTextComp.prototype.render = function () {
            var data = this.props.nodeData;
            return (dom['div']({ className: 'nn_node', key: data.id }, dom['div']({
                className: 'nn_text' + (data.owner && data.owner.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, data.text), dom['div']({ className: 'nn_nested' }, data.nested ? data.nested.map(function (nestedData) { return exports.NestedTextElem({ nodeData: nestedData }); }) : false)));
        };
        NestedTextComp.prototype.handleClick = function () {
            var actions = this.context.documentActions;
            actions && actions.focusNodeById(this.props.nodeData.id);
        };
        return NestedTextComp;
    })(React.Component);
    var NestedTextDocumentComp = (function (_super) {
        __extends(NestedTextDocumentComp, _super);
        function NestedTextDocumentComp() {
            _super.apply(this, arguments);
        }
        NestedTextDocumentComp.prototype.getChildContext = function () {
            return { documentActions: this.props.documentActions };
        };
        NestedTextDocumentComp.prototype.render = function () {
            return (dom['div']({ className: 'nn_ctx' }, exports.NestedTextElem({ nodeData: this.props.nodeData })));
        };
        return NestedTextDocumentComp;
    })(React.Component);
});
