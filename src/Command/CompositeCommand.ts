import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


class CompositeCommand implements Command {

    constructor(
        private commands: Command[]
    ) {}

    execute(): N {
        return CompositeCommand.eachCommand(this.commands, 'execute');
    }

    undo(): N {
        return CompositeCommand.eachCommand(this.commands.slice(0).reverse(), 'undo');
    }

    private static eachCommand(commands: Command[], action: string): N {
        var result;
        commands.forEach((command, i) => {
            if (i > 0) {
                result.root.unselectDeep();
            }
            result = command[action]();
        });
        return result;
    }

}


export = CompositeCommand;
