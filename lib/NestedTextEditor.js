var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './NNDocument', './NNDocumentView', './NestedNodeView', 'pkg/React/React'], function (require, exports, NNDocument, NNDocumentView, NestedNodeView, React) {
    var dom = React.DOM;
    require(['pkg/require-css/css!../styles/NestedNodeStyle']);
    var NestedTextDocument = (function (_super) {
        __extends(NestedTextDocument, _super);
        function NestedTextDocument() {
            _super.apply(this, arguments);
        }
        NestedTextDocument.prototype.getBlankNodeData = function () {
            return { text: '' };
        };
        NestedTextDocument.prototype.nodeDataDuplicator = function (data) {
            return { text: data.text };
        };
        NestedTextDocument.prototype.nodeDataEqualityChecker = function (data1, data2) {
            return data1.text === data2.text;
        };
        return NestedTextDocument;
    })(NNDocument);
    var TextInputComponent = (function (_super) {
        __extends(TextInputComponent, _super);
        function TextInputComponent(props, context) {
            _super.call(this, props, context);
            if (!this.props.onChange) {
                this.props.onChange = function () {
                };
            }
        }
        TextInputComponent.prototype.render = function () {
            return dom['div']({
                contentEditable: true,
                onInput: this.handleInput.bind(this),
                onFocus: function (e) {
                    e.stopPropagation();
                },
                dangerouslySetInnerHTML: { __html: this.props.value }
            });
        };
        TextInputComponent.prototype.handleInput = function (e) {
            this.props.onChange(e.target.innerText);
        };
        TextInputComponent.prototype.componentDidMount = function () {
            var domNode = React.findDOMNode(this);
            // курсор почему-то в начале строки, перемещаем его в конец
            var range = document.createRange();
            range.selectNodeContents(domNode);
            range.collapse(false);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            domNode.focus();
        };
        return TextInputComponent;
    })(React.Component);
    var NestedTextNodeView = (function (_super) {
        __extends(NestedTextNodeView, _super);
        function NestedTextNodeView() {
            _super.apply(this, arguments);
        }
        NestedTextNodeView.prototype.renderData = function (data, editMode) {
            return editMode ? React.createElement(TextInputComponent, {
                value: data.text,
                onChange: this.handleTextChange.bind(this)
            }) : data.text;
        };
        NestedTextNodeView.prototype.handleTextChange = function (value) {
            this.context.documentActions.updateNodeData({ text: value });
        };
        return NestedTextNodeView;
    })(NestedNodeView.Component);
    function render(doc) {
        var docElem = NNDocumentView.Element({
            documentActions: doc,
            documentProps: doc,
            nestedNodeViewComponent: NestedTextNodeView
        });
        React.render(docElem, document.body);
    }
    var docData = { data: { text: 'hello world!' }, nested: [
        { data: { text: 'космос' }, nested: [
            { data: { text: '9' } },
            { data: { text: '8' } },
            { data: { text: '7' } },
            { data: { text: '6' } },
            { data: { text: '5' } },
            { data: { text: '4' } },
            { data: { text: '3' } },
            { data: { text: '2' } },
            { data: { text: '1' } },
            { data: { text: 'поехали!' } }
        ] },
        { data: { text: 'foo bar' }, nested: [
        ] }
    ] };
    var doc = new NestedTextDocument(docData);
    doc.addListener('change', render);
    render(doc);
});
