define(["require", "exports", 'pkg/React/React', './NestedTextReact', './NestedTextDocument'], function (require, exports, React, NestedTextReact, NestedTextDocument) {
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
    render();
    function render() {
        var docElem = NestedTextReact.NestedTextDocumentElem({
            node: doc.content,
            documentActions: doc
        });
        React.render(docElem, document.body);
    }
});
