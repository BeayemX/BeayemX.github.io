class SelectLinesAction {

    constructor(points) {
        this.points = points;
    }

    Do() {
        console.log("SelectLinesAction Do()");
    }

    undo() {
        console.log("SelectLinesAction undo()");
    }
}