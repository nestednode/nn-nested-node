// todo: переименовать в SiblingDirection после того как уберется OrderedStore
define(["require", "exports"], function (require, exports) {
    var SequenceDirection;
    (function (SequenceDirection) {
        SequenceDirection[SequenceDirection["Preceding"] = 0] = "Preceding";
        SequenceDirection[SequenceDirection["Following"] = 1] = "Following";
    })(SequenceDirection || (SequenceDirection = {}));
    return SequenceDirection;
});
