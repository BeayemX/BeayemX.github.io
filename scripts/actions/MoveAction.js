class MoveAction {
    // TODO shouldn't need to save points. if selection is also an action
    constructor(points, current, start) {
        this.points = points;
        this.current = current;
        this.start = start;
    }

    Do() {
        let delta = this.current.copy().SubtractVector(this.start);
        UTILITIES.movePointsBy(this.points, delta);
    }

    Undo() {
        let delta = this.start.copy().SubtractVector(this.current);
        UTILITIES.movePointsBy(this.points, delta);
    }
}