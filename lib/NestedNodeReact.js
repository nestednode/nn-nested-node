var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/React/React'], function (require, exports, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    exports.NestedNodeElem = React.createFactory(NestedNodeComp);
    exports.NestedNodeDocumentElem = React.createFactory(DocumentComp);
    var NestedNodeComp = (function (_super) {
        __extends(NestedNodeComp, _super);
        function NestedNodeComp() {
            _super.apply(this, arguments);
        }
        NestedNodeComp.prototype.render = function () {
            var data = this.props.nodeData;
            return (dom['div']({ className: 'nn_node', key: data.id }, dom['div']({
                className: ('nn_text' + data.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, data.text), dom['div']({ className: 'nn_nested' }, data.map(function (nestedData) { return exports.NestedNodeElem({ nodeData: nestedData }); }))));
        };
        NestedNodeComp.prototype.handleClick = function () {
            var actions = this.context.documentActions;
            actions && actions.focusNodeById(this.props.nodeData.id);
        };
        return NestedNodeComp;
    })(React.Component);
    var DocumentComp = (function (_super) {
        __extends(DocumentComp, _super);
        function DocumentComp() {
            _super.apply(this, arguments);
        }
        DocumentComp.prototype.getChildContext = function () {
            return { documentActions: this.props.documentActions };
        };
        DocumentComp.prototype.render = function () {
            return (dom['div']({ className: 'nn_ctx' }, exports.NestedNodeElem({ nodeData: this.props.nodeData })));
        };
        return DocumentComp;
    })(React.Component);
});
