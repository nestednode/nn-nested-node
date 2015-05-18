import React = require('pkg/React/React');
import NestedTextReact = require('./NestedTextReact');
import NestedTextDocument = require('./NestedTextDocument');

var docData = { text: 'hello world!' };
var doc = new NestedTextDocument(docData);

var docElem = NestedTextReact.NestedTextDocumentElem({
    nodeData: doc.root.data,
    documentActions: doc
});

React.render(docElem, document.body);
