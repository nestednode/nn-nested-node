import NNDocument = require('./NNDocument');
import NNDocumentView = require('./NNDocumentView');
import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');

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

    createElement(props) {
        return React.createElement(NestedTextNodeView, props);
    }

    renderData(data) {
        return data.text + (this.context.documentProps.editMode ? '*' : '');
    }

}

var nodeViewFactory = React.createFactory<NestedNodeView.Props<TextData>>(NestedTextNodeView);


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

var render = function() {
    var docElem = NNDocumentView.Element<TextData>({
        documentActions: doc,
        documentProps: doc,
        nodeViewFactory: nodeViewFactory
    });
    React.render(docElem, document.body);
};

doc.addListener('change', render);
render();
