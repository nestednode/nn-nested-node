define(["require", "exports"], function (require, exports) {
    // псевдо-команда для использования в составе CompositeCommand
    var PreserveFocusCommand = (function () {
        function PreserveFocusCommand(nodeToFocus) {
            this.nodeToFocus = nodeToFocus;
        }
        PreserveFocusCommand.prototype.execute = function () {
            return this.nodeToFocus.select();
        };
        PreserveFocusCommand.prototype.undo = function () {
            return this.nodeToFocus.select();
        };
        return PreserveFocusCommand;
    })();
    return PreserveFocusCommand;
});
