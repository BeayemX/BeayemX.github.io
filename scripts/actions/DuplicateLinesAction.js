class DuplicateLinesAction {
    constructor(lines) // TODO lines or points?
    {
        this.duplicateLines = lines;
    }

    Do() {
        console.log("DuplicateLinesAction Do()");
    }

    Undo() {
        console.log("DuplicateLinesAction Undo()");
    }
}