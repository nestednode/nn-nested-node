var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'pkg/React/React', './NestedTextReact', './NestedTextDocument'], function (require, exports, React, NestedNodeReact, NestedTextDocument) {
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
    var NestedTextNodeView = (function (_super) {
        __extends(NestedTextNodeView, _super);
        function NestedTextNodeView() {
            _super.apply(this, arguments);
        }
        NestedTextNodeView.prototype.createElement = function (props) {
            return React.createElement(NestedTextNodeView, props);
        };
        NestedTextNodeView.prototype.renderData = function (data) {
            return data.text + (this.context.editMode ? '*' : '');
        };
        return NestedTextNodeView;
    })(NestedNodeReact.NodeViewComp);
    render();
    function render() {
        var docElem = NestedNodeReact.DocumentView({
            node: doc.node,
            documentActions: doc,
            editMode: doc.editMode,
            nodeViewFactory: React.createFactory(NestedTextNodeView)
        });
        React.render(docElem, document.body);
    }
});
