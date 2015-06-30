import Command = require('./Command');
import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode
import Direction = require('../Direction');


class AppendCommand implements Command {

    private anchorNode: N;

    // и aheadNode, и anchorNode служат для указания места вставки
    // aheadNode - всегда указывает на узел, перед которым нужно вставить новый;
    // anchorNode (в паре с direction) - может указывать на вставку как перед ним, так и после него
    constructor(nodesToAppend: N[], parentNode: N); // узлы просто добавляются в конец
    constructor(nodesToAppend: N[], parentNode: N, aheadNode: N);
    constructor(nodesToAppend: N[], parentNode: N, anchorNode: N, direction: Direction);
    // последняя сигнатура используется когда при undo нужно вернуть фокус не к parent, а к anchor

    constructor(
        private nodesToAppend: N[],
        private parentNode: N,
        private aheadNode?: N,
        direction?: Direction
    ) {
        if (direction) {
            // только если явно передан direction, сохраняем anchorNode и возвращаем его при undo
            this.anchorNode = aheadNode;
            if (this.anchorNode && direction.isForward) {
                this.aheadNode = this.anchorNode.getSibling();
            }
        }
    }

    execute(): N {
        this.nodesToAppend.forEach(node => node.appendToParent(this.parentNode, this.aheadNode).select());
        return this.nodesToAppend.slice(-1)[0];
    }

    undo(): N {
        this.nodesToAppend.forEach(node => node.removeFormParent());
        return (this.anchorNode || this.parentNode).select();
    }

}


export = AppendCommand;
