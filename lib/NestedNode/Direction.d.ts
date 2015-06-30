declare class Direction {
    private _isForward;
    constructor(_isForward: boolean);
    isForward: boolean;
    isBackward: boolean;
    getInverted(): Direction;
    static getForward(): Direction;
    static getBackward(): Direction;
}
export = Direction;
