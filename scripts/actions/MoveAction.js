class MoveAction {
    // TODO shouldn't need to save points. if selection is also an action
    constructor(points, current, start) {
        this.points = points;
        this.current = current;
        this.start = start;
    }

    Do() {
        let delta = {
            x: this.current.x - this.start.x,
            y: this.current.y - this.start.y
        };
        UTILITIES.movePointsBy(this.points, delta);
    }

    Undo() {
        let delta = {
            x: this.start.x - this.current.x,
            y: this.start.y - this.current.y
        };
        UTILITIES.movePointsBy(this.points, delta);
    }
}
/*
class MoveAction {
    // TODO shouldn't need to save points. if selection is also an action
    constructor(points, current, start) {
        this.points = points;
        this.current = current;
        this.start = start;
    }

    Do() {
        let delta = this.current.copy().Subtract(this.start);
        UTILITIES.movePointsBy(this.points, delta);
    }

    Undo() {
        let delta = this.start.copy().Subtract(this.current);
        UTILITIES.movePointsBy(this.points, delta);
    }
}
*/