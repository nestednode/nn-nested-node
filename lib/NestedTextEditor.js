define(["require", "exports", 'pkg/React/React', './NestedTextReact', './NestedTextDocument'], function (require, exports, React, NestedTextReact, NestedTextDocument) {
    var docData = { text: 'hello world!' };
    var doc = new NestedTextDocument(docData);
    var docElem = NestedTextReact.NestedTextDocumentElem({
        nodeData: doc.root.data,
        documentActions: doc
    });
    React.render(docElem, document.body);
});
