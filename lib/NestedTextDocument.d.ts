import NestedNodeDocument = require('./NestedNodeDocument');
import NestedText = require('./NestedText');
declare class NestedTextDocument extends NestedNodeDocument<NestedText> {
    getBlankNodeData(): NestedText;
    isNodeDataBlank(data: NestedText): boolean;
    nodeFieldDuplicator(data: NestedText): NestedText;
}
export = NestedTextDocument;
