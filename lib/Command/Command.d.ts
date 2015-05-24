import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
interface Command {
    execute(): N;
    undo(): N;
}
export = Command;
