class Selection {
    constructor() {
        console.log("Selection created");
        this.points = [];
        this.partialLines = [];
        this.lines = [];
    }

    addPoint(point) {
        // point already included
        for (let p of this.points) {
            if (p === point)
                return;
        }

        // check if opposite is also selected
        let other = point.opposite;

        for (let p of this.points) {
        // opposite is included
            if (p === other) {
                this.lines.push(point.line);
                UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line)
                UTILITIES.deleteArrayEntry(this.points, other);
                return;
            }
        }

        // oppsite isn't included
        this.points.push(point);
        this.partialLines.push(point.line)
        UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line)
    }

    removePoint(point) {
        let returnValue = UTILITIES.deleteArrayEntry(this.points, point)

        if (returnValue == null) { // opposite not selected
            FILE.currentLayer.lines.push(point.line)
            UTILITIES.deleteArrayEntry(this.partialLines, point.line);
        } else { // opposite is selected
            this.partialLines.push(point.line);
            UTILITIES.deleteArrayEntry(this.lines, point.line);
            this.points.push(point.opposite);
        }
    }

    // TODO should check if point is already selected 
    //DONT USE
    addLine(line) {
        console.log("Dangerous use!");
        this.lines.push(line);
        UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, line);
        FILE.updateStats();
    }
    removeLine(line) {
        UTILITIES.deleteArrayEntry(this.lines, line);
    }

    clearSelection() {
        FILE.currentLayer.lines = FILE.currentLayer.lines.concat(this.lines);
        FILE.currentLayer.lines = FILE.currentLayer.lines.concat(this.partialLines);

        this.points = [];
        this.partialLines = [];
        this.lines = [];

        FILE.currentLayer.cleanUpFile();
    }

    selectEverything() {
        this.clearSelection();
        this.lines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = [];
    }

    noSelection() {
        return this.points.length == 0 && this.partialLines.length == 0 && this.lines.length == 0;
    }

    invertSelection() {
        let tmp = this.lines;
        this.lines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = tmp;

        for (var i = 0; i < this.points.length; i++) {
            this.points[i] = this.points[i].opposite;
        }
    }

    deleteSelection() {
        this.lines = [];
        this.partialLines = [];

        // TODO PERFORMANCE maybe use slice here, becaus 'deleteArrayEntry iterates over whole array for every delete...
        for (let point of this.points)
            UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line);

        this.points = [];
        FILE.updateStats();
    }

    getAllSelectedPoints() {
        return UTILITIES.linesToPoints(this.lines).concat(this.points);
    }

    isPointSelected(point) {
        for (let p of this.points) {
            if (p == point) {
                return true;
            }
        }
        for (let l of this.lines) {
            if (point == l.start || point === l.end) {
                return true;
            }
        }

        return false;
    }

    changeSelectionForPoints(points) {
        for (let p of points) {
            if (this.isPointSelected(p))
                this.removePoint(p);
            else
                this.addPoint(p);
        }
    }
}