import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Direction = require('../Direction');
declare class AppendCommand implements Command {
    private nodeset;
    private target;
    private anchorNode;
    private nodeBefore;
    constructor(nodeset: N[], target: N, anchorNode?: N, direction?: Direction);
    execute(): N;
    undo(): N;
}
export = AppendCommand;
