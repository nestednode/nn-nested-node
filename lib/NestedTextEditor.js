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
    var NestedTextNodeView = (function (_super) {
        __extends(NestedTextNodeView, _super);
        function NestedTextNodeView() {
            _super.apply(this, arguments);
        }
        NestedTextNodeView.prototype.renderData = function (data, editMode) {
            return editMode ? dom['input']({ value: data.text, onChange: this.handleChange.bind(this) }) : data.text;
        };
        NestedTextNodeView.prototype.handleChange = function (e) {
            this.context.documentActions.updateNodeData({ text: e.target.value });
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
