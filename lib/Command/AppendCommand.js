define(["require", "exports"], function (require, exports) {
    var AppendCommand = (function () {
        function AppendCommand(nodesToAppend, parentNode, anchorNode, direction) {
            this.nodesToAppend = nodesToAppend;
            this.parentNode = parentNode;
            this.anchorNode = anchorNode;
            this.aheadNode = anchorNode;
            if (anchorNode && direction && direction.isForward) {
                this.aheadNode = anchorNode.getSibling();
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
