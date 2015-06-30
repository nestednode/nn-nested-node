import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
declare class DuplicateCommand implements Command {
    private originalNodes;
    private duplicatedNodes;
    constructor(originalNodes: N[], duplicatedNodes: N[]);
    execute(): N;
    undo(): N;
}
export = DuplicateCommand;
