import React = require('pkg/React/React');
import NestedTextReact = require('./NestedTextReact');
import NestedTextDocument = require('./NestedTextDocument');

var docData = { text: 'hello world!', nested: [
    { text: 'космос', nested: [
        { text: '9'},
        { text: '8'},
        { text: '7'},
        { text: '6'},
        { text: '5'},
        { text: '4'},
        { text: '3'},
        { text: '2'},
        { text: '1'},
        { text: 'поехали!'}
    ]},
    { text: 'foo bar', nested: [

    ]}
]};


var doc = new NestedTextDocument(docData);
doc.addListener('change', render);

render();


function render() {
    var docElem = NestedTextReact.NestedTextDocumentElem({
        nodeData: doc.data,
        documentActions: doc
    });
    React.render(docElem, document.body);
}
