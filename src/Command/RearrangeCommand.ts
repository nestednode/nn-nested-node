import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class RearrangeCommand implements Command {

    constructor(
        private nodeToRearrange: N,
        private selection: N[],
        private direction: Direction
    ) {}

    execute(): N {
        return this.rearrangeBy(this.direction);
    }

    undo(): N {
        return this.rearrangeBy(this.direction.getInverted());
    }

    private rearrangeBy(direction: Direction) {
        var parent = this.nodeToRearrange.parent;
        this.nodeToRearrange.makeParentless();
        var lastIndex = this.selection.length - 1;
        var nodeBefore = direction.isForward ? this.selection[0] : this.selection[lastIndex].getSibling();
        parent.appendNested(this.nodeToRearrange, nodeBefore);
        this.selection.forEach(node => node.select());
        return this.selection[lastIndex];
    }

}


export = RearrangeCommand;
