class Line {
    constructor(x1, y1, x2, y2) {
        if (arguments.length == 2) {
            this.start = new Point(x1.x, x1.y, this);
            this.end = new Point(y1.x, y1.y, this);
        }
        else if (arguments.length == 4) {
            this.start = new Point(x1, y1, this);
            this.end = new Point(x2, y2, this);
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

    opposite(point)
    {
        if (point == this.start)
            return this.end;
        else
            return this.start;
    }

    toString() {
        return "Line from " + this.start + " to " + this.end;
    }
}