import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Direction = require('../Direction');
declare class AppendCommand implements Command {
    private nodesToAppend;
    private parentNode;
    private aheadNode;
    private anchorNode;
    constructor(nodesToAppend: N[], parentNode: N);
    constructor(nodesToAppend: N[], parentNode: N, aheadNode: N);
    constructor(nodesToAppend: N[], parentNode: N, anchorNode: N, direction: Direction);
    execute(): N;
    undo(): N;
}
export = AppendCommand;
