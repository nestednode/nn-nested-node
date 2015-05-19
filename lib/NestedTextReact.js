var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/React/React'], function (require, exports, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    // объекты этого класса служат:
    // - результатом для функции getChildContext (при передаче реального аргумента в конструктор),
    // - значением для почему-то обязательных реактовских деклараций contextTypes и childContextTypes
    // сам класс в роли интерфейса используется:
    // - для указания типа поля context
    // - в декларации DocumentProps
    var DocumentContext = (function () {
        function DocumentContext(documentActions) {
            if (documentActions === void 0) { documentActions = React.PropTypes.any; }
            this.documentActions = documentActions;
        }
        return DocumentContext;
    })();
    exports.DocumentContext = DocumentContext;
    // * Components
    // оказывается, класс в генерируемом коде объявляется как
    // var NestedTextComp = ...
    // а не как
    // function NestedTextComp ...
    // поэтому в данном месте еще нельзя ссылаться на нижеописанные классы,
    // хотя компилятор ни о чем таком не предупреждает:
    //export var NestedTextElem = React.createFactory<NestedTextProps>(NestedTextComp);
    //export var NestedTextDocumentElem = React.createFactory<DocumentProps>(NestedTextDocumentComp);
    exports.NestedTextElem;
    var NestedTextComp = (function (_super) {
        __extends(NestedTextComp, _super);
        function NestedTextComp() {
            _super.apply(this, arguments);
        }
        NestedTextComp.prototype.render = function () {
            var data = this.props.nodeData;
            return (dom['div']({ className: 'nn_node', key: data.owner.id }, dom['div']({
                className: 'nn_text' + (data.owner && data.owner.selected ? ' selected' : ''),
                onClick: this.handleClick.bind(this)
            }, data.text), dom['div']({ className: 'nn_nested' }, data.nested ? data.nested.map(function (nestedData, key) { return exports.NestedTextElem({ nodeData: nestedData, key: key }); }) : false)));
        };
        NestedTextComp.prototype.handleClick = function () {
            var actions = this.context.documentActions;
            var owner = this.props.nodeData.owner;
            actions && owner && actions.focusNodeById(owner.id);
        };
        // без этой декларации this.context будет пустым
        NestedTextComp.contextTypes = new DocumentContext();
        return NestedTextComp;
    })(React.Component);
    exports.NestedTextElem = React.createFactory(NestedTextComp);
    var NestedTextDocumentComp = (function (_super) {
        __extends(NestedTextDocumentComp, _super);
        function NestedTextDocumentComp() {
            _super.apply(this, arguments);
        }
        NestedTextDocumentComp.prototype.getChildContext = function () {
            return new DocumentContext(this.props.documentActions);
        };
        NestedTextDocumentComp.prototype.render = function () {
            return (dom['div']({ className: 'nn_ctx' }, exports.NestedTextElem({ nodeData: this.props.nodeData })));
        };
        // без этой декларации getChildContext() бросит исключение
        NestedTextDocumentComp.childContextTypes = new DocumentContext();
        return NestedTextDocumentComp;
    })(React.Component);
    exports.NestedTextDocumentElem = React.createFactory(NestedTextDocumentComp);
});
