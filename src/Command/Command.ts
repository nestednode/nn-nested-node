import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


interface Command {

    execute(): N;
    undo(): N;
    //cleanup();

}


export = Command;
