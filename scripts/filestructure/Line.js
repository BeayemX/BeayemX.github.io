class Line {
    constructor(x1, y1, x2, y2, color, thickness) {
        if (x1 instanceof Vector2) {
            this.start = new LineEnding(x1.x, x1.y, this);
            this.end = new LineEnding(y1.x, y1.y, this);
        }
        else {
            this.start = new LineEnding(x1, y1, this);
            this.end = new LineEnding(x2, y2, this);
        }

        this.color = (color) ? color : currentLineColor.copy();
        this.thickness = (thickness) ? thickness : currentLineThickness;
    }
    // TODO use vector2.equals
    static overlapping(line1, line2) {
        return (line1.start.position.x == line2.start.position.x
        && line1.start.position.y == line2.start.position.y
        && line1.end.position.x == line2.end.position.x
        && line1.end.position.y == line2.end.position.y)
        ||
        (line1.start.position.x == line2.end.position.x
        && line1.start.position.y == line2.end.position.y
        && line1.end.position.x == line2.start.position.x
        && line1.end.position.y == line2.start.position.y);
    }

    setEnd(p) {
        this.end = new LineEnding(p.x, p.y, this);
    }

    opposite(point) {
        if (point == this.start)
            return this.end;
        else
            return this.start;
    }

    toString() {
        return "Line from " + this.start.position + " to " + this.end.position;
    }
}