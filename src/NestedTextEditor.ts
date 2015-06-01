import NNDocument = require('./NNDocument');
import NNDocumentView = require('./NNDocumentView');
import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


interface TextData {
    text: string;
}


class NestedTextDocument extends NNDocument<TextData> {

    getBlankNodeData(): TextData {
        return { text: '' };
    }

    nodeDataDuplicator(data: TextData): TextData {
        return { text: data.text };
    }

    nodeDataEqualityChecker(data1: TextData, data2: TextData): boolean {
        return data1.text === data2.text;
    }

}


class NestedTextNodeView extends NestedNodeView.Component<TextData> {

    renderData(data, editMode) {
        return editMode ? dom['input']({ value: data.text, onChange: this.handleChange.bind(this) }) : data.text;
    }

    handleChange(e) {
        this.context.documentActions.updateNodeData({ text: e.target.value });
    }

}


function render(doc: NestedTextDocument) {
    var docElem = NNDocumentView.Element<TextData>({
        documentActions: doc,
        documentProps: doc,
        nestedNodeViewComponent: NestedTextNodeView
    });
    React.render(docElem, document.body);
}


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
render(doc);
