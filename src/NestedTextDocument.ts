import NestedNodeDocument = require('./NestedNodeDocument');
import NestedNode = require('./NestedNode');
import NestedText = require('./NestedText');


class NestedTextDocument extends NestedNodeDocument<NestedText> {

    getBlankNodeData(): NestedText {
        return { text: '' };
    }

    nodeDataDuplicator(data: NestedText): NestedText {
        return { text: data.text };
    }

}


export = NestedTextDocument;
