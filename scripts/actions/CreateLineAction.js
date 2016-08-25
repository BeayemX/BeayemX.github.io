class CreateLineAction {
    constructor(line)
    {
        this.line = line;
    }

    Do() {
        console.log("CreateLineAction Do()");
    }

    undo() {
        console.log("CreateLineAction undo()");
    }
}