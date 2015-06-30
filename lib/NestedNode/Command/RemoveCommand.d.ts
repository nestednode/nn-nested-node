import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
declare class RemoveCommand implements Command {
    private targets;
    constructor(nodesToRemove: N[]);
    execute(): N;
    undo(): N;
}
export = RemoveCommand;
