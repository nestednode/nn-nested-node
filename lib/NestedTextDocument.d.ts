import NestedNodeDocument = require('./NestedNodeDocument');
import NestedText = require('./NestedText');
declare class NestedTextDocument extends NestedNodeDocument<NestedText> {
    getBlankNodeData(): NestedText;
    nodeFieldDuplicator(data: NestedText): NestedText;
}
export = NestedTextDocument;
