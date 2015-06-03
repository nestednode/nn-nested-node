var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './SelectionMode', 'pkg/React/React'], function (require, exports, SelectionMode, React) {
    var dom = React.DOM;
    // если не обернуть в модуль, ide будет считать, например,
    // что Props из этого модуля, и Props из модуля NNDocumentView - это partial-определения одного общего интерфейса
    var NestedNodeView;
    (function (NestedNodeView) {
        var Context = (function () {
            function Context(documentActions, documentProps) {
                if (documentActions === void 0) { documentActions = React.PropTypes.any; }
                if (documentProps === void 0) { documentProps = React.PropTypes.any; }
                this.documentActions = documentActions;
                this.documentProps = documentProps;
            }
            return Context;
        })();
        NestedNodeView.Context = Context;
        var Component = (function (_super) {
            __extends(Component, _super);
            // без явного определения конструктора, вывод типов сглючит (см. generic_constructor_type__bug в лабах)
            function Component(props, context) {
                _super.call(this, props, context);
            }
            Component.prototype.render = function () {
                var _this = this;
                var node = this.props.node;
                return (dom['div']({ className: 'nn_node' }, dom['div']({
                    className: 'nn_text' + (node.selected ? ' selected' : ''),
                    onClick: this.handleClick.bind(this)
                }, this.renderData(node.data, this.context.documentProps.editMode && node.focused)), dom['div']({ className: 'nn_nested' }, node.nested ? node.nested.map(function (nestedNode) { return _this.renderNestedElement(nestedNode); }) : false)));
            };
            Component.prototype.renderNestedElement = function (node) {
                var props = { node: node, key: node.id };
                return React.createElement(this['constructor'], props);
            };
            Component.prototype.renderData = function (data, editMode) {
                throw new Error('abstract method');
            };
            Component.prototype.handleClick = function (e) {
                var actions = this.context.documentActions;
                var selectionMode = e.metaKey ? 1 /* Toggle */ : e.shiftKey ? 2 /* Shift */ : 0 /* Reset */;
                actions && actions.focusNodeById(this.props.node.id, selectionMode);
            };
            // без этой декларации this.context будет пустым
            Component.contextTypes = new Context();
            return Component;
        })(React.Component);
        NestedNodeView.Component = Component;
    })(NestedNodeView || (NestedNodeView = {}));
    return NestedNodeView;
});
