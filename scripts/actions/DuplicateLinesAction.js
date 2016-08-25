class DuplicateLinesAction {
    constructor(lines) // TODO lines or points?
    {
        this.duplicateLines = lines;
    }

    Do() {
        console.log("DuplicateLinesAction Do()");
    }

    undo() {
        console.log("DuplicateLinesAction undo()");
    }
}