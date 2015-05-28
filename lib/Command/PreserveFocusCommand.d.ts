import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
declare class PreserveFocusCommand implements Command {
    private nodeToFocus;
    constructor(nodeToFocus: N);
    execute(): N;
    undo(): N;
}
export = PreserveFocusCommand;
