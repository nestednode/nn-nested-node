import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class AppendCommand implements Command {

    private nodeBefore: N;

    constructor(
        private nodeset: N[],
        private target: N,
        private anchorNode?: N,
        direction?: Direction
    ) {
        this.nodeBefore = anchorNode;
        if (anchorNode && direction && direction.isForward) {
            this.nodeBefore = anchorNode.getSibling();
        }
    }

    execute(): N {
        this.nodeset.forEach(node => this.target.appendNested(node, this.nodeBefore).select());
        return this.nodeset.slice(-1)[0];
    }

    undo(): N {
        this.nodeset.forEach(node => this.target.removeNested(node));
        return (this.anchorNode || this.target).select();
    }

}


export = AppendCommand;
