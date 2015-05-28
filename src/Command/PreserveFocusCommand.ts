import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


// псевдо-команда для использования в составе CompositeCommand
class PreserveFocusCommand implements Command {

    constructor(
        private nodeToFocus: N
    ) {}

    execute(): N {
        return this.nodeToFocus.select();
    }

    undo(): N {
        return this.nodeToFocus.select();
    }

}


export = PreserveFocusCommand;
