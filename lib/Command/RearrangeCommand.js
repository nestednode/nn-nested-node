define(["require", "exports"], function (require, exports) {
    var RearrangeCommand = (function () {
        function RearrangeCommand(nodeToRearrange, selection, direction) {
            this.nodeToRearrange = nodeToRearrange;
            this.selection = selection;
            this.direction = direction;
        }
        RearrangeCommand.prototype.execute = function () {
            return this.rearrangeBy(this.direction);
        };
        RearrangeCommand.prototype.undo = function () {
            return this.rearrangeBy(this.direction.getInverted());
        };
        RearrangeCommand.prototype.rearrangeBy = function (direction) {
            var parent = this.nodeToRearrange.parent;
            this.nodeToRearrange.makeParentless();
            var lastIndex = this.selection.length - 1;
            var nodeBefore = direction.isForward ? this.selection[0] : this.selection[lastIndex].getSibling();
            parent.appendNested(this.nodeToRearrange, nodeBefore);
            this.selection.forEach(function (node) { return node.select(); });
            return this.selection[lastIndex];
        };
        return RearrangeCommand;
    })();
    return RearrangeCommand;
});
