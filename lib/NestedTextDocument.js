var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './NestedNodeDocument', './NestedNode'], function (require, exports, NestedNodeDocument, NestedNode) {
    var NestedTextDocument = (function (_super) {
        __extends(NestedTextDocument, _super);
        function NestedTextDocument(data) {
            _super.call(this);
            this.root = new NestedNode(this, data, function (d) { return ({ text: d.text }); });
            this.focusNode(this.root);
        }
        return NestedTextDocument;
    })(NestedNodeDocument);
    return NestedTextDocument;
});
