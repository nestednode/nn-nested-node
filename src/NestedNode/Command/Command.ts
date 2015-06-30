import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;


interface Command {

    // перед каждой операцией документ снимает выделение у всех узлов,
    // так что задача команды не только провести необходимые манипуляции,
    // но и восстановить выделение у нужных узлов, а также вернуть узел, который будет в фокусе
    execute(): N;
    undo(): N;

    //todo
    //cleanup();

}


export = Command;
