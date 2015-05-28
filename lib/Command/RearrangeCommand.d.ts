import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Direction = require('../Direction');
declare class RearrangeCommand implements Command {
    private nodesToRearrange;
    private direction;
    constructor(nodesToRearrange: N[], direction: Direction);
    execute(): N;
    undo(): N;
    private arrangeByDirection(direction);
    static canExecute(nodesToRearrange: N[], direction: Direction): boolean;
    private static getNodeToArrange(nodesToRearrange, direction);
}
export = RearrangeCommand;
