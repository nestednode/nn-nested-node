import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class RearrangeCommand implements Command {

    constructor(
        private nodesToRearrange: N[],
        private direction: Direction
    ) {}

    execute(): N {
        return this.arrangeByDirection(this.direction);
    }

    undo(): N {
        return this.arrangeByDirection(this.direction.getInverted());
    }

    private arrangeByDirection(direction: Direction) {
        // вместо сдвига каждого,
        // приводим это действие к перестановке соседнего узла через nodesToRearrange;
        var nodeToArrange = RearrangeCommand.getNodeToArrange(this.nodesToRearrange, direction);
        var lastIndex = this.nodesToRearrange.length - 1;
        var aheadNode = direction.isForward ? this.nodesToRearrange[0] : this.nodesToRearrange[lastIndex].getSibling();
        nodeToArrange.arrangeBefore(aheadNode);
        this.nodesToRearrange.forEach(node => node.select());
        return this.nodesToRearrange[lastIndex];
    }

    static canExecute(nodesToRearrange: N[], direction: Direction): boolean {
        return !! this.getNodeToArrange(nodesToRearrange, direction);
    }

    private static getNodeToArrange(nodesToRearrange: N[], direction: Direction): N {
        var boundaryIndex = direction.isForward ? nodesToRearrange.length - 1 : 0;
        return nodesToRearrange[boundaryIndex].getSibling(direction);
    }

}


export = RearrangeCommand;
