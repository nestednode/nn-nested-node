import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


class DuplicateCommand implements Command {

    constructor(
        private originalNodes: N[],
        private duplicatedNodes: N[]
    ) {
    }

    execute(): N {
        var lastNode = this.originalNodes.slice(-1)[0];
        var parentNode = lastNode.parent;
        var aheadNode = lastNode.getSibling();
        this.duplicatedNodes.forEach(node => node.appendToParent(parentNode, aheadNode).select());
        return this.duplicatedNodes.slice(-1)[0];
    }

    undo(): N {
        this.duplicatedNodes.forEach(node => node.removeFormParent());
        this.originalNodes.forEach(node => node.select());
        return this.originalNodes.slice(-1)[0];
    }

}


export = DuplicateCommand;
