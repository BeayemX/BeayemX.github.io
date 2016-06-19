﻿class Line {
    constructor(x1, y1, x2, y2, selected) {
        this.start = new GridPoint(x1, y1);
        this.end = new GridPoint(x2, y2);

        if (arguments.length == 5) {
            this.start.selected = selected;
            this.end.selected = selected;
        }
    }

    get SelectedPoints() {
        if (this.start.selected && this.end.selected) return 2;
        else if (this.start.selected || this.end.selected) return 1;
        else return 0;
    }
}