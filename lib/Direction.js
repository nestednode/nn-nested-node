define(["require", "exports"], function (require, exports) {
    var Direction = (function () {
        //private
        function Direction(_isForward) {
            this._isForward = _isForward;
        }
        Object.defineProperty(Direction.prototype, "isForward", {
            get: function () {
                return this._isForward;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Direction.prototype, "isBackward", {
            get: function () {
                return !this._isForward;
            },
            enumerable: true,
            configurable: true
        });
        Direction.prototype.getInverted = function () {
            return new Direction(!this._isForward);
        };
        Direction.getForward = function () {
            return new Direction(true);
        };
        Direction.getBackward = function () {
            return new Direction(false);
        };
        return Direction;
    })();
    return Direction;
});
