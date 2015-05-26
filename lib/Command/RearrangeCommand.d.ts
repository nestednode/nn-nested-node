import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Direction = require('../Direction');
declare class RearrangeCommand implements Command {
    private nodeToRearrange;
    private selection;
    private direction;
    constructor(nodeToRearrange: N, selection: N[], direction: Direction);
    execute(): N;
    undo(): N;
    private rearrangeBy(direction);
}
export = RearrangeCommand;
