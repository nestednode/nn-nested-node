import Command = require('./Command');
import NestedNode = require('../NestedNode');
declare class UpdateDataCommand<D> implements Command {
    private nodeToUpdate;
    private oldData;
    private newData;
    constructor(nodeToUpdate: NestedNode<D>, oldData: D, newData: D);
    execute(): NestedNode<D>;
    undo(): NestedNode<D>;
}
export = UpdateDataCommand;
