import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
declare class CompositeCommand implements Command {
    private commands;
    constructor(commands: Command[]);
    execute(): N;
    undo(): N;
    private static eachCommand(commands, action);
}
export = CompositeCommand;
