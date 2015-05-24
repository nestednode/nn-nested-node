import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class RemoveCommand implements Command {

    private targets: { target: N; node: N; nodeBefore: N }[];

    constructor(nodeset: N[]) {
        this.targets = nodeset.map(node => ({
            target: node.parent,
            node: node,
            nodeBefore: node.getSibling()
        }));
    }

    execute(): N  {
        var lastIndex = this.targets.length - 1;
        var node;
        var relatedNode;
        // использую for для единого стиля с undo
        for (var i = 0; i <= lastIndex; i++) {
            node = this.targets[i].node;
            if (i == lastIndex) {
                relatedNode = node.getSibling() || node.getSibling(Direction.getBackward()) || node.parent;
            }
            node.makeParentless();
        }
        return relatedNode.select();
    }

    undo(): N {
        var lastIndex = this.targets.length - 1;
        var item;
        // в обратном порядке, чтобы уже точно был прикреплен nodeBefore
        for (var i = lastIndex; i >= 0; i--) {
            item = this.targets[i];
            item.target.appendNested(item.node, item.nodeBefore).select();
        }
        return this.targets[lastIndex].node;
    }

}


export = RemoveCommand;
