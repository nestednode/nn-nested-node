define(["require", "exports"], function (require, exports) {
    var ReplaceRootCommand = (function () {
        function ReplaceRootCommand(document, newRoot) {
            this.document = document;
            this.newRoot = newRoot;
        }
        ReplaceRootCommand.prototype.execute = function () {
            this.oldRoot = this.document.replaceRoot(this.newRoot);
            return this.newRoot.select();
        };
        ReplaceRootCommand.prototype.undo = function () {
            this.document.replaceRoot(this.oldRoot);
            return this.oldRoot.select();
        };
        return ReplaceRootCommand;
    })();
    return ReplaceRootCommand;
});
