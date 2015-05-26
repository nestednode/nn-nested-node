define(["require", "exports", '../Direction'], function (require, exports, Direction) {
    var RemoveCommand = (function () {
        function RemoveCommand(nodesToRemove) {
            this.targets = nodesToRemove.map(function (node) { return ({
                parentNode: node.parent,
                node: node,
                aheadNode: node.getSibling()
            }); });
        }
        RemoveCommand.prototype.execute = function () {
            var lastIndex = this.targets.length - 1;
            var node;
            var relatedNode;
            for (var i = 0; i <= lastIndex; i++) {
                node = this.targets[i].node;
                if (i == lastIndex) {
                    relatedNode = node.getSibling() || node.getSibling(Direction.getBackward()) || node.parent;
                }
                node.makeParentless();
            }
            return relatedNode.select();
        };
        RemoveCommand.prototype.undo = function () {
            var lastIndex = this.targets.length - 1;
            var item;
            for (var i = lastIndex; i >= 0; i--) {
                item = this.targets[i];
                item.parentNode.appendNested(item.node, item.aheadNode).select();
            }
            return this.targets[lastIndex].node;
        };
        return RemoveCommand;
    })();
    return RemoveCommand;
});
