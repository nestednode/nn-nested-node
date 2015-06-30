import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
declare class EnvelopeCommand implements Command {
    private nodesToEnvelope;
    private newNode;
    private parentNode;
    private aheadNode;
    constructor(nodesToEnvelope: N[], newNode: N);
    execute(): N;
    undo(): N;
}
export = EnvelopeCommand;
