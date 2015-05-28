define(["require", "exports"], function (require, exports) {
    var AppendCommand = (function () {
        // последняя сигнатура используется когда при undo нужно вернуть фокус не к parent, а к anchor
        function AppendCommand(nodesToAppend, parentNode, aheadNode, direction) {
            this.nodesToAppend = nodesToAppend;
            this.parentNode = parentNode;
            this.aheadNode = aheadNode;
            if (direction) {
                // только если явно передан direction, сохраняем anchorNode и возвращаем его при undo
                this.anchorNode = aheadNode;
                if (this.anchorNode && direction.isForward) {
                    this.aheadNode = this.anchorNode.getSibling();
                }
            }
        }
        AppendCommand.prototype.execute = function () {
            var _this = this;
            this.nodesToAppend.forEach(function (node) { return node.appendToParent(_this.parentNode, _this.aheadNode).select(); });
            return this.nodesToAppend.slice(-1)[0];
        };
        AppendCommand.prototype.undo = function () {
            this.nodesToAppend.forEach(function (node) { return node.removeFormParent(); });
            return (this.anchorNode || this.parentNode).select();
        };
        return AppendCommand;
    })();
    return AppendCommand;
});
