var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'bower_components/nn-react/React', '../NestedNodeProps/SelectionMode', './KeyboardUtil'], function (require, exports, React, SelectionMode, KeyboardUtil) {
    var dom = React.DOM;
    var KeyMod = KeyboardUtil.KeyMod;
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
                this.handleClick = this.handleClick.bind(this);
                this.handleDoubleClick = this.handleDoubleClick.bind(this);
                this.handleKeyPress = this.handleKeyPress.bind(this);
            }
            Component.prototype.render = function () {
                var _this = this;
                var node = this.props.node;
                var nodeBemBlock = 'nn__node';
                var nodeCls = [nodeBemBlock];
                node.selected && nodeCls.push(nodeBemBlock + '_selected');
                this.props.editing && nodeCls.push(nodeBemBlock + '_editing');
                return (dom['div']({ className: nodeCls.join(' ') }, dom['div']({
                    tabIndex: 0,
                    ref: 'databox',
                    className: 'nn__node-databox',
                    onClick: this.handleClick,
                    onDoubleClick: this.handleDoubleClick,
                    onKeyPress: this.handleKeyPress
                }, this.renderData(node.data, this.props.editing)), node.nested && node.nested.length ? dom['div']({ className: 'nn__node-nested' }, node.nested.map(function (nestedNode) { return _this.renderNestedElement(nestedNode); })) : null));
            };
            Component.prototype.componentDidMount = function () {
                this.checkFocus(false, false);
            };
            Component.prototype.componentDidUpdate = function (prevProps, prevState, prevContext) {
                this.checkFocus(prevProps.focused, prevProps.editing);
            };
            Component.prototype.checkFocus = function (prevFocused, prevEditing) {
                if (this.props.focused && (!prevFocused || !this.props.editing && prevEditing)) {
                    React.findDOMNode(this.refs['databox']).focus();
                }
            };
            Component.prototype.renderNestedElement = function (node) {
                var props = {
                    node: node,
                    focused: node.focused,
                    editing: this.context.documentProps.editMode && node.focused,
                    key: node.id
                };
                return React.createElement(this['constructor'], props);
            };
            /*abstract*/
            Component.prototype.renderData = function (data, editMode) {
                throw new Error('abstract method');
            };
            Component.prototype.handleClick = function (e) {
                e.stopPropagation(); // важно прекратить всплытие, обработчик в documentView на это рассчитывает
                if (this.props.editing) {
                    return;
                }
                if (this.context.documentProps.editMode) {
                    // какой-то другой узел в режиме редактирования, автоматически из него выходим
                    //todo это поведение правильнее вынести в логику документа
                    this.context.documentActions.exitEditMode();
                }
                var selectionMode = e[KeyMod.CTRL] ? 1 /* Toggle */ : e[KeyMod.SHIFT] ? 2 /* Shift */ : 0 /* Reset */;
                this.context.documentActions.focusNodeById(this.props.node.id, selectionMode);
            };
            Component.prototype.handleDoubleClick = function (e) {
                if (this.props.editing) {
                    return;
                }
                this.context.documentActions.focusNodeById(this.props.node.id, 0 /* Reset */);
                this.context.documentActions.enterEditMode();
            };
            Component.prototype.handleKeyPress = function (e) {
            };
            // без этой декларации this.context будет пустым
            Component.contextTypes = new Context();
            return Component;
        })(React.Component);
        NestedNodeView.Component = Component;
    })(NestedNodeView || (NestedNodeView = {}));
    return NestedNodeView;
});
