class Direction {

    //private
    constructor(
        private _isForward: boolean
    ) { }

    get isForward(): boolean {
        return this._isForward;
    }

    get isBackward(): boolean {
        return ! this._isForward;
    }

    getInverted(): Direction {
        return new Direction(! this._isForward);
    }

    static getForward(): Direction {
        return new Direction(true);
    }

    static getBackward(): Direction {
        return new Direction(false);
    }
}


export = Direction;
