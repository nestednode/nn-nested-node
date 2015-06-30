define(["require", "exports"], function (require, exports) {
    var UpdateDataCommand = (function () {
        function UpdateDataCommand(nodeToUpdate, oldData, newData) {
            this.nodeToUpdate = nodeToUpdate;
            this.oldData = oldData;
            this.newData = newData;
        }
        UpdateDataCommand.prototype.execute = function () {
            this.nodeToUpdate.data = this.newData;
            return this.nodeToUpdate.select();
        };
        UpdateDataCommand.prototype.undo = function () {
            this.nodeToUpdate.data = this.oldData;
            return this.nodeToUpdate.select();
        };
        return UpdateDataCommand;
    })();
    return UpdateDataCommand;
});
