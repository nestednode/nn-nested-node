define(["require", "exports"], function (require, exports) {
    var RearrangeCommand = (function () {
        function RearrangeCommand(nodesToRearrange, direction) {
            this.nodesToRearrange = nodesToRearrange;
            this.direction = direction;
        }
        RearrangeCommand.prototype.execute = function () {
            return this.arrangeByDirection(this.direction);
        };
        RearrangeCommand.prototype.undo = function () {
            return this.arrangeByDirection(this.direction.getInverted());
        };
        RearrangeCommand.prototype.arrangeByDirection = function (direction) {
            // вместо сдвига каждого,
            // приводим это действие к перестановке соседнего узла через nodesToRearrange;
            var nodeToArrange = RearrangeCommand.getNodeToArrange(this.nodesToRearrange, direction);
            var lastIndex = this.nodesToRearrange.length - 1;
            var aheadNode = direction.isForward ? this.nodesToRearrange[0] : this.nodesToRearrange[lastIndex].getSibling();
            nodeToArrange.arrangeBefore(aheadNode);
            this.nodesToRearrange.forEach(function (node) { return node.select(); });
            return this.nodesToRearrange[lastIndex];
        };
        RearrangeCommand.canExecute = function (nodesToRearrange, direction) {
            return !!this.getNodeToArrange(nodesToRearrange, direction);
        };
        RearrangeCommand.getNodeToArrange = function (nodesToRearrange, direction) {
            var boundaryIndex = direction.isForward ? nodesToRearrange.length - 1 : 0;
            return nodesToRearrange[boundaryIndex].getSibling(direction);
        };
        return RearrangeCommand;
    })();
    return RearrangeCommand;
});
