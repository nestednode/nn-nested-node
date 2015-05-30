import React = require('pkg/React/React');
import NestedNodeReact = require('./NestedTextReact');
import NestedTextDocument = require('./NestedTextDocument');
import TextData = require('./TextData');


var docData = { data: { text: 'hello world!' }, nested: [
    { data: { text: 'космос' }, nested: [
        { data: { text: '9'} },
        { data: { text: '8'} },
        { data: { text: '7'} },
        { data: { text: '6'} },
        { data: { text: '5'} },
        { data: { text: '4'} },
        { data: { text: '3'} },
        { data: { text: '2'} },
        { data: { text: '1'} },
        { data: { text: 'поехали!'} }
    ]},
    { data: { text: 'foo bar'}, nested: [

    ]}
]};


var doc = new NestedTextDocument(docData);
doc.addListener('change', render);


class NestedTextNodeView extends NestedNodeReact.NodeViewComp<TextData> {

    createElement(props) {
        return React.createElement(NestedTextNodeView, props);
    }

    renderData(data) {
        return data.text + (this.context.editMode ? '*' : '');
    }

}


render();


function render() {
    var docElem = NestedNodeReact.DocumentView<TextData>({
        node: doc.node,
        documentActions: doc,
        editMode: doc.editMode,
        nodeViewFactory: React.createFactory(NestedTextNodeView)
    });
    React.render(docElem, document.body);
}
