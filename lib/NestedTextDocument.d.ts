import NestedNodeDocument = require('./NestedNodeDocument');
import TextData = require('./TextData');
declare class NestedTextDocument extends NestedNodeDocument<TextData> {
    getBlankNodeData(): TextData;
    nodeDataDuplicator(data: TextData): TextData;
    nodeDataEqualityChecker(data1: TextData, data2: TextData): boolean;
}
export = NestedTextDocument;
