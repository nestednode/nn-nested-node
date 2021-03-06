import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class RemoveCommand implements Command {

    private targets: { parentNode: N; node: N; aheadNode: N }[];

    constructor(nodesToRemove: N[]) {
        this.targets = nodesToRemove.map(node => ({
            parentNode: node.parent,
            node: node,
            aheadNode: node.getSibling()
        }));
    }

    execute(): N  {
        var lastIndex = this.targets.length - 1;
        var node;
        var relatedNode;
        for (var i = 0; i <= lastIndex; i++) {
            node = this.targets[i].node;
            if (i == lastIndex) {
                relatedNode = node.getSibling() || node.getSibling(Direction.getBackward()) || node.parent;
            }
            node.removeFormParent();
        }
        return relatedNode.select();
    }

    undo(): N {
        var lastIndex = this.targets.length - 1;
        var item;
        // в обратном порядке, чтобы уже точно был прикреплен aheadNode
        for (var i = lastIndex; i >= 0; i--) {
            item = this.targets[i];
            item.parentNode.appendNested(item.node, item.aheadNode).select();
        }
        return this.targets[lastIndex].node;
    }

}


export = RemoveCommand;
