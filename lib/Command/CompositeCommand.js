define(["require", "exports"], function (require, exports) {
    var CompositeCommand = (function () {
        function CompositeCommand(commands) {
            this.commands = commands;
        }
        CompositeCommand.prototype.execute = function () {
            return CompositeCommand.eachCommand(this.commands, 'execute');
        };
        CompositeCommand.prototype.undo = function () {
            return CompositeCommand.eachCommand(this.commands.slice(0).reverse(), 'undo');
        };
        CompositeCommand.eachCommand = function (commands, action) {
            var result;
            commands.forEach(function (command, i) {
                if (i > 0) {
                    result.root.unselectDeep();
                }
                result = command[action]();
            });
            return result;
        };
        return CompositeCommand;
    })();
    return CompositeCommand;
});
