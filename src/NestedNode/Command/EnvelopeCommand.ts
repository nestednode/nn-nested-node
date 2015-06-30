import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


class EnvelopeCommand implements Command {

    private parentNode: N;
    private aheadNode: N;

    constructor(
        private nodesToEnvelope: N[],
        private newNode: N
    ) {
        var lastNode = this.nodesToEnvelope.slice(-1)[0];
        this.parentNode = lastNode.parent;
        this.aheadNode = lastNode.getSibling();
    }

    execute(): N {
        this.nodesToEnvelope.forEach(node => node.removeFormParent().appendToParent(this.newNode));
        return this.newNode.appendToParent(this.parentNode, this.aheadNode).select();
    }

    undo(): N {
        this.newNode.removeFormParent();
        this.nodesToEnvelope.forEach(node => {
            node.removeFormParent().appendToParent(this.parentNode, this.aheadNode).select();
        });
        return this.nodesToEnvelope.slice(-1)[0];
    }

}


export = EnvelopeCommand;
