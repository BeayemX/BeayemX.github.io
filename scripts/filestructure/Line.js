class Line {
    constructor(x1, y1, x2, y2) {
        if (arguments.length == 2) {
            this.start = x1;
            this.end = y1;
        }
        else if (arguments.length == 4) {
            this.start = new Vector2(x1, y1);
            this.end = new Vector2(x2, y2);
        }
    }
    // TODO use vector2.equals
    static overlapping(line1, line2) { 
        return (line1.start.x == line2.start.x
        && line1.start.y == line2.start.y
        && line1.end.x == line2.end.x
        && line1.end.y == line2.end.y)
        ||
        (line1.start.x == line2.end.x
        && line1.start.y == line2.end.y
        && line1.end.x == line2.start.x
        && line1.end.y == line2.start.y);
    }

    toString() {
        return "Line from " + this.start + " to " + this.end;
    }
}