define(["require", "exports"], function (require, exports) {
    var EnvelopeCommand = (function () {
        function EnvelopeCommand(nodesToEnvelope, newNode) {
            this.nodesToEnvelope = nodesToEnvelope;
            this.newNode = newNode;
            this.aheadNode = this.nodesToEnvelope.slice(-1)[0].getSibling();
        }
        EnvelopeCommand.prototype.execute = function () {
            var _this = this;
            var parent = this.nodesToEnvelope[0].parent;
            this.nodesToEnvelope.forEach(function (node) { return node.makeParentless().attachToParent(_this.newNode); });
            return parent.appendNested(this.newNode, this.aheadNode).select();
        };
        EnvelopeCommand.prototype.undo = function () {
            var _this = this;
            var parent = this.newNode.parent;
            this.newNode.makeParentless();
            this.nodesToEnvelope.forEach(function (node) {
                node.makeParentless();
                parent.appendNested(node, _this.aheadNode).select();
            });
            return this.nodesToEnvelope.slice(-1)[0];
        };
        return EnvelopeCommand;
    })();
    return EnvelopeCommand;
});
