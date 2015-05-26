import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import NestedNodeDocument = require('../NestedNodeDocument');
declare class ReplaceRootCommand implements Command {
    private document;
    private newRoot;
    private oldRoot;
    constructor(document: NestedNodeDocument<any>, newRoot: N);
    execute(): N;
    undo(): N;
}
export = ReplaceRootCommand;
