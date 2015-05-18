import NestedNodeDocument = require('./NestedNodeDocument');
import NestedText = require('./NestedText');
declare class NestedTextDocument extends NestedNodeDocument<NestedText> {
    constructor(data: NestedText);
}
export = NestedTextDocument;
