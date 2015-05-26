import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


class EnvelopeCommand implements Command {

    private aheadNode: N;

    constructor(
        private nodesToEnvelope: N[],
        private newNode: N
    ) {
        this.aheadNode = this.nodesToEnvelope.slice(-1)[0].getSibling();
    }

    execute(): N {
        var parent = this.nodesToEnvelope[0].parent;
        this.nodesToEnvelope.forEach(node => node.makeParentless().attachToParent(this.newNode));
        return parent.appendNested(this.newNode, this.aheadNode).select();
    }

    undo(): N {
        var parent = this.newNode.parent;
        this.newNode.makeParentless();
        this.nodesToEnvelope.forEach(node => {
            node.makeParentless();
            parent.appendNested(node, this.aheadNode).select();
        });
        return this.nodesToEnvelope.slice(-1)[0];
    }

}


export = EnvelopeCommand;
