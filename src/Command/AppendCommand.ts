import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class AppendCommand implements Command {

    private nodeBefore: N;

    constructor(
        private nodesToAppend: N[],
        private parentNode: N,
        private anchorNode?: N,
        direction?: Direction
    ) {
        this.nodeBefore = anchorNode;
        if (anchorNode && direction && direction.isForward) {
            this.nodeBefore = anchorNode.getSibling();
        }
    }

    execute(): N {
        this.nodesToAppend.forEach(node => this.parentNode.appendNested(node, this.nodeBefore).select());
        return this.nodesToAppend.slice(-1)[0];
    }

    undo(): N {
        this.nodesToAppend.forEach(node => this.parentNode.removeNested(node));
        return (this.anchorNode || this.parentNode).select();
    }

}


export = AppendCommand;
