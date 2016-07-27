﻿class Selection {
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
                UTILITIES.deleteArrayEntry(this.partialLines, point.line)
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
        // opposite not selected
        for (let p of this.points) {
            if (p === point) {
                UTILITIES.deleteArrayEntry(this.points, point);
                UTILITIES.deleteArrayEntry(this.partialLines, point.line);
                FILE.currentLayer.lines.push(point.line);
                return;
            }
        }

        // opposite selected
        for (let l of this.lines) {
            if (l === point.line) {
                UTILITIES.deleteArrayEntry(this.lines, point.line);
                this.points.push(point.opposite);
                this.partialLines.push(point.line);
                return;
            }
        }
        FILE.currentLayer.cleanUpFile();
    }

    // TODO should check if point is already selected 
    //DONT USE
    addLine(line) {
        console.log("Dangerous use!");
        this.lines.push(line);
        UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, line);
        FILE.updateStats();
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
        FILE.currentLayer.cleanUpFile();
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
        return UTILITIES.linesToLineEndings(this.lines).concat(this.points);
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
        FILE.currentLayer.cleanUpFile();
    }

    getUnselectedPointsOfPartialLines() {
        let points = [];
        for (let p of this.points)
            points.push(p.opposite);

        return points;
    }
}