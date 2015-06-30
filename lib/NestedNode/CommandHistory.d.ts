import NestedNode = require('./NestedNode');
import N = NestedNode.AnyNestedNode;
import Command = require('./Command/Command');
import Direction = require('./Direction');
declare class CommandHistory {
    private current;
    private baseEntry;
    constructor();
    setCurrentEntryAsBaseEntry(): void;
    isCurrentEntryBaseEntry(): boolean;
    push(command: Command): void;
    canStepTo(direction: Direction): boolean;
    stepTo(direction: Direction): N;
    canUndo(): boolean;
    undo(): N;
    canRedo(): boolean;
    redo(): N;
}
export = CommandHistory;
