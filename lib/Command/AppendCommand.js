define(["require", "exports"], function (require, exports) {
    var AppendCommand = (function () {
        function AppendCommand(nodeset, target, anchorNode, direction) {
            this.nodeset = nodeset;
            this.target = target;
            this.anchorNode = anchorNode;
            this.nodeBefore = anchorNode;
            if (anchorNode && direction && direction.isForward) {
                this.nodeBefore = anchorNode.getSibling();
            }
        }
        AppendCommand.prototype.execute = function () {
            var _this = this;
            this.nodeset.forEach(function (node) { return _this.target.appendNested(node, _this.nodeBefore).select(); });
            return this.nodeset.slice(-1)[0];
        };
        AppendCommand.prototype.undo = function () {
            var _this = this;
            this.nodeset.forEach(function (node) { return _this.target.removeNested(node); });
            return (this.anchorNode || this.target).select();
        };
        return AppendCommand;
    })();
    return AppendCommand;
});
