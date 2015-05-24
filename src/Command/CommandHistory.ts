import NestedNode = require('../NestedNode');
import N = NestedNode.AnyNestedNode;
import Command = require('./Command');
import Direction = require('../Direction');


// служит как маркер начала истории
class InitialCommand implements Command {

    execute(): N { return null; }
    undo(): N { return null; }

}


class HistoryEntry {

    constructor(
        public command: Command,
        public previous: HistoryEntry = null,
        public next: HistoryEntry = null
    ){}

    //cleanup() {
    //    this.command.cleanup();
    //    if (this.next !== null) {
    //        this.next.cleanup();
    //    }
    //    this.command = this.previous = this.next = null;
    //}

}


class CommandHistory {

    private current: HistoryEntry;
    private baseEntry: HistoryEntry;

    constructor() {
        this.baseEntry = this.current = new HistoryEntry(new InitialCommand());
    }

    setCurrentEntryAsBaseEntry(): void {
        this.baseEntry = this.current;
    }

    isCurrentEntryBaseEntry(): boolean {
        return this.baseEntry === this.current;
    }
    
    push(command: Command) {
        if (this.canRedo()) {
            // todo
            //this.current.next.cleanup();
            this.current.next = null;
        }
        var prevEntry = this.current;
        this.current = new HistoryEntry(command);
        prevEntry.next = this.current;
        this.current.previous = prevEntry;
    }

    canStepTo(direction: Direction): boolean {
        return direction.isBackward ? this.canUndo() : this.canRedo();
    }

    stepTo(direction: Direction): N {
        return direction.isBackward ? this.undo() : this.redo();
    }

    canUndo(): boolean {
        return !(this.current.command instanceof InitialCommand);
    }

    undo(): N {
        var result = this.current.command.undo();
        this.current = this.current.previous;
        return result;
    }

    canRedo(): boolean {
        return this.current.next !== null;
    }

    redo(): N {
        this.current = this.current.next;
        return this.current.command.execute();
    }

}



export = CommandHistory;
