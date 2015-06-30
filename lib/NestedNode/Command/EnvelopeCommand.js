define(["require", "exports"], function (require, exports) {
    var EnvelopeCommand = (function () {
        function EnvelopeCommand(nodesToEnvelope, newNode) {
            this.nodesToEnvelope = nodesToEnvelope;
            this.newNode = newNode;
            var lastNode = this.nodesToEnvelope.slice(-1)[0];
            this.parentNode = lastNode.parent;
            this.aheadNode = lastNode.getSibling();
        }
        EnvelopeCommand.prototype.execute = function () {
            var _this = this;
            this.nodesToEnvelope.forEach(function (node) { return node.removeFormParent().appendToParent(_this.newNode); });
            return this.newNode.appendToParent(this.parentNode, this.aheadNode).select();
        };
        EnvelopeCommand.prototype.undo = function () {
            var _this = this;
            this.newNode.removeFormParent();
            this.nodesToEnvelope.forEach(function (node) {
                node.removeFormParent().appendToParent(_this.parentNode, _this.aheadNode).select();
            });
            return this.nodesToEnvelope.slice(-1)[0];
        };
        return EnvelopeCommand;
    })();
    return EnvelopeCommand;
});
