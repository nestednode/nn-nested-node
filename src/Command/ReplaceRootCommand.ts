import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import NestedNodeDocument = require('../NestedNodeDocument');



class ReplaceRootCommand implements Command {

    private oldRoot: N;

    constructor(
        private document: NestedNodeDocument<any>,
        private newRoot: N
    ) {}

    execute(): N {
        this.oldRoot = this.document.replaceRoot(this.newRoot);
        return this.newRoot.select();
    }

    undo(): N {
        this.document.replaceRoot(this.oldRoot);
        return this.oldRoot.select();
    }

}


export = ReplaceRootCommand;
