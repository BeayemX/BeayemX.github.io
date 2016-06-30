class Line {
    constructor(x1, y1, x2, y2, selected) {

        let sel = false;

        if (arguments.length == 2 || arguments.length == 3) {
            this.start = x1;
            this.end = y1;
        }
        else if (arguments.length == 4 || arguments.length == 5) {
            this.start = new Point(x1, y1);
            this.end = new Point(x2, y2);
        }

        if (arguments.length == 3)
            sel = x2;
        else if (arguments.length == 5)
            sel = selected;


        this.start.selected = sel;
        this.end.selected = sel;
    }

    get SelectedPoints() {
        if (this.start.selected && this.end.selected) return 2;
        else if (this.start.selected || this.end.selected) return 1;
        else return 0;
    }

    toString() {
        return "Line from " + this.start + " to " + this.end + ".";
    }
}