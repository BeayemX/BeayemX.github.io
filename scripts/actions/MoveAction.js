class MoveAction {
    // TODO shouldn't need to save points. if selection is also an action
    constructor(points, delta) {
        this.points = points;
        this.delta = delta
    }

    Do() {
        Utilities.movePointsBy(this.points, this.delta);
    }

    Undo() {
        Utilities.movePointsBy(this.points, this.delta.flipped());
    }
}