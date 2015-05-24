define(["require", "exports"], function (require, exports) {
    // служит как маркер начала истории
    var InitialCommand = (function () {
        function InitialCommand() {
        }
        InitialCommand.prototype.execute = function () {
            return null;
        };
        InitialCommand.prototype.undo = function () {
            return null;
        };
        return InitialCommand;
    })();
    var HistoryEntry = (function () {
        function HistoryEntry(command, previous, next) {
            if (previous === void 0) { previous = null; }
            if (next === void 0) { next = null; }
            this.command = command;
            this.previous = previous;
            this.next = next;
        }
        return HistoryEntry;
    })();
    var CommandHistory = (function () {
        function CommandHistory() {
            this.baseEntry = this.current = new HistoryEntry(new InitialCommand());
        }
        CommandHistory.prototype.setCurrentEntryAsBaseEntry = function () {
            this.baseEntry = this.current;
        };
        CommandHistory.prototype.isCurrentEntryBaseEntry = function () {
            return this.baseEntry === this.current;
        };
        CommandHistory.prototype.push = function (command) {
            if (this.canRedo()) {
                // todo
                //this.current.next.cleanup();
                this.current.next = null;
            }
            var prevEntry = this.current;
            this.current = new HistoryEntry(command);
            prevEntry.next = this.current;
            this.current.previous = prevEntry;
        };
        CommandHistory.prototype.canStepTo = function (direction) {
            return direction.isBackward ? this.canUndo() : this.canRedo();
        };
        CommandHistory.prototype.stepTo = function (direction) {
            return direction.isBackward ? this.undo() : this.redo();
        };
        CommandHistory.prototype.canUndo = function () {
            return !(this.current.command instanceof InitialCommand);
        };
        CommandHistory.prototype.undo = function () {
            var result = this.current.command.undo();
            this.current = this.current.previous;
            return result;
        };
        CommandHistory.prototype.canRedo = function () {
            return this.current.next !== null;
        };
        CommandHistory.prototype.redo = function () {
            this.current = this.current.next;
            return this.current.command.execute();
        };
        return CommandHistory;
    })();
    return CommandHistory;
});
