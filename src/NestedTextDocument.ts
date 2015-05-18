import NestedNodeDocument = require('./NestedNodeDocument');
import NestedNode = require('./NestedNode');
import NestedText = require('./NestedText');


class NestedTextDocument extends NestedNodeDocument<NestedText> {

    constructor(data: NestedText) {
        super();
        this.root = new NestedNode<NestedText>(this, data, d => ({ text: d.text }));
        this.focusNode(this.root);
    }

}


export = NestedTextDocument;
