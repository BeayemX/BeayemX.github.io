class CreateLineAction {
    constructor(line)
    {
        this.line = line;
    }

    Do() {
        console.log("CreateLineAction Do()");
    }

    Undo() {
        console.log("CreateLineAction Undo()");
    }
}