var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './NestedNodeDocument'], function (require, exports, NestedNodeDocument) {
    var NestedTextDocument = (function (_super) {
        __extends(NestedTextDocument, _super);
        function NestedTextDocument() {
            _super.apply(this, arguments);
        }
        NestedTextDocument.prototype.getBlankNodeData = function () {
            return { text: '' };
        };
        NestedTextDocument.prototype.isNodeDataBlank = function (data) {
            return data.text == '';
        };
        NestedTextDocument.prototype.nodeFieldDuplicator = function (data) {
            return { text: data.text };
        };
        return NestedTextDocument;
    })(NestedNodeDocument);
    return NestedTextDocument;
});
