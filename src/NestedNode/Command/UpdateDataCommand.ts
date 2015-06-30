import Command = require('./Command');
import NestedNode = require('../NestedNode');


class UpdateDataCommand<D> implements Command {

    constructor(
        private nodeToUpdate: NestedNode<D>,
        private oldData: D,
        private newData: D
    ) {}

    execute(): NestedNode<D> {
        this.nodeToUpdate.data = this.newData;
        return this.nodeToUpdate.select();
    }

    undo(): NestedNode<D> {
        this.nodeToUpdate.data = this.oldData;
        return this.nodeToUpdate.select();
    }

}


export = UpdateDataCommand;
