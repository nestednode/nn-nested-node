import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Direction = require('../Direction');
declare class AppendCommand implements Command {
    private nodesToAppend;
    private parentNode;
    private anchorNode;
    private nodeBefore;
    constructor(nodesToAppend: N[], parentNode: N, anchorNode?: N, direction?: Direction);
    execute(): N;
    undo(): N;
}
export = AppendCommand;
