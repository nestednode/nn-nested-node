export declare var KeyMod: {
    CTRL: string;
    ALT: string;
    SHIFT: string;
};
export declare class Shortcut {
    private keyEvent;
    private static keyMods;
    constructor(keyEvent: KeyboardEvent);
    eq(keyCode: number, ...mods: string[]): boolean;
}
export declare var KeyCode: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    CANCEL: number;
    HELP: number;
    BACK_SPACE: number;
    TAB: number;
    CLEAR: number;
    RETURN: number;
    SHIFT: number;
    CONTROL: number;
    ALT: number;
    PAUSE: number;
    CAPS_LOCK: number;
    ESCAPE: number;
    SPACE: number;
    PAGE_UP: number;
    PAGE_DOWN: number;
    END: number;
    HOME: number;
    LEFT: number;
    UP: number;
    RIGHT: number;
    DOWN: number;
    PRINTSCREEN: number;
    INSERT: number;
    DELETE: number;
    SEMICOLON: number;
    EQUALS: number;
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
    G: number;
    H: number;
    I: number;
    J: number;
    K: number;
    L: number;
    M: number;
    N: number;
    O: number;
    P: number;
    Q: number;
    R: number;
    S: number;
    T: number;
    U: number;
    V: number;
    W: number;
    X: number;
    Y: number;
    Z: number;
    CONTEXT_MENU: number;
    NUMPAD0: number;
    NUMPAD1: number;
    NUMPAD2: number;
    NUMPAD3: number;
    NUMPAD4: number;
    NUMPAD5: number;
    NUMPAD6: number;
    NUMPAD7: number;
    NUMPAD8: number;
    NUMPAD9: number;
    MULTIPLY: number;
    ADD: number;
    SEPARATOR: number;
    SUBTRACT: number;
    DECIMAL: number;
    DIVIDE: number;
    F1: number;
    F2: number;
    F3: number;
    F4: number;
    F5: number;
    F6: number;
    F7: number;
    F8: number;
    F9: number;
    F10: number;
    F11: number;
    F12: number;
    F13: number;
    F14: number;
    F15: number;
    F16: number;
    F17: number;
    F18: number;
    F19: number;
    F20: number;
    F21: number;
    F22: number;
    F23: number;
    F24: number;
    NUM_LOCK: number;
    SCROLL_LOCK: number;
    COMMA: number;
    PERIOD: number;
    SLASH: number;
    BACK_QUOTE: number;
    OPEN_BRACKET: number;
    BACK_SLASH: number;
    CLOSE_BRACKET: number;
    QUOTE: number;
    META: number;
};
