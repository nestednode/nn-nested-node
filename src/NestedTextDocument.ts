import NestedNodeDocument = require('./NestedNodeDocument');
import DocumentActions = require('./DocumentActions');
import TextData = require('./TextData');


class NestedTextDocument extends NestedNodeDocument<TextData> {

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


export = NestedTextDocument;
