define(["require", "exports"], function (require, exports) {
    var DuplicateCommand = (function () {
        function DuplicateCommand(originalNodes, duplicatedNodes) {
            this.originalNodes = originalNodes;
            this.duplicatedNodes = duplicatedNodes;
        }
        DuplicateCommand.prototype.execute = function () {
            var lastNode = this.originalNodes.slice(-1)[0];
            var parentNode = lastNode.parent;
            var aheadNode = lastNode.getSibling();
            this.duplicatedNodes.forEach(function (node) { return node.appendToParent(parentNode, aheadNode).select(); });
            return this.duplicatedNodes.slice(-1)[0];
        };
        DuplicateCommand.prototype.undo = function () {
            this.duplicatedNodes.forEach(function (node) { return node.removeFormParent(); });
            this.originalNodes.forEach(function (node) { return node.select(); });
            return this.originalNodes.slice(-1)[0];
        };
        return DuplicateCommand;
    })();
    return DuplicateCommand;
});
