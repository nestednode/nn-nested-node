define(["require", "exports"], function (require, exports) {
    var SelectionMode;
    (function (SelectionMode) {
        SelectionMode[SelectionMode["Reset"] = 0] = "Reset";
        SelectionMode[SelectionMode["Toggle"] = 1] = "Toggle";
        SelectionMode[SelectionMode["Shift"] = 2] = "Shift";
    })(SelectionMode || (SelectionMode = {}));
    return SelectionMode;
});
