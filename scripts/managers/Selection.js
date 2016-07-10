class Selection {
    constructor() {
        console.log("Selection created");
        this.selectedPoints = [];
        this.selectedLines = [];
    }

    addPoint(point) {
        for (let p of this.selectedPoints) {
            if (p === point)
                return;
        }
        let other = point.opposite;
        // check if other is also selected
        for (let p of this.selectedPoints) {
            if (p === other) {
                this.selectedLines.push(point.line);
                UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line)
                UTILITIES.deleteArrayEntry(this.selectedPoints, other);
                return;
            }
        }
        this.selectedPoints.push(point);
    }

    removePoint(point) {
        // if only this point was selected
        if (UTILITIES.deleteArrayEntry(this.selectedPoints, point) == null) {

            // if point's line was selected
            FILE.currentLayer.lines.push(point.line);
            UTILITIES.deleteArrayEntry(this.selectedLines, point.line);
            this.selectedPoints.push(point.opposite);
        }
    }

    // TODO should check if point is already selected 
    //DONT USE
    addLine(line) {
        console.log("Dangerous use!");
        this.selectedLines.push(line);
        UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, line);
        FILE.updateStats();
    }
    removeLine(line) {
        UTILITIES.deleteArrayEntry(this.selectedLines, line);
    }

    clearSelection() {
        FILE.currentLayer.lines = FILE.currentLayer.lines.concat(this.selectedLines);
        this.selectedPoints = [];
        this.selectedLines = [];
        FILE.currentLayer.cleanUpFile();
    }

    selectEverything() {
        this.clearSelection();
        this.selectedLines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = [];
    }

    noSelection() {
        return this.selectedPoints.length == 0 && this.selectedLines.length == 0;
    }

    invertSelection() {
        let tmp = this.selectedLines;
        this.selectedLines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = tmp;

        for (var i = 0; i < this.selectedPoints.length; i++) {
            this.selectedPoints[i] = this.selectedPoints[i].opposite;
        }
    }

    deleteSelection() {
        this.selectedLines = [];

        // TODO PERFORMANCE maybe use slice here, becaus 'deleteArrayEntry iterates over whole array for every delete...
        for (let point of this.selectedPoints)
            UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line);

        this.selectedPoints = [];
        FILE.updateStats();
    }

    getAllSelectedPoints() {
        return UTILITIES.linesToPoints(this.selectedLines).concat(this.selectedPoints);
    }

    isPointSelected(point) {
        for (let p of this.selectedPoints) {
            if (p == point) {
                return true;
            }
        }
        for (let l of this.selectedLines) {
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