import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class AppendCommand implements Command {

    private aheadNode: N;

    constructor(
        private nodesToAppend: N[],
        private parentNode: N,
        private anchorNode?: N,
        direction?: Direction
    ) {
        this.aheadNode = anchorNode;
        if (anchorNode && direction && direction.isForward) {
            this.aheadNode = anchorNode.getSibling();
        }
    }

    execute(): N {
        this.nodesToAppend.forEach(node => node.appendToParent(this.parentNode, this.aheadNode).select());
        return this.nodesToAppend.slice(-1)[0];
    }

    undo(): N {
        this.nodesToAppend.forEach(node => node.removeFormParent());
        return (this.anchorNode || this.parentNode).select();
    }

}


export = AppendCommand;
