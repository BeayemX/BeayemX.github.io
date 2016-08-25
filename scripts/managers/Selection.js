class Selection {
    static init() {
        console.log("Selection created");
        this.points = [];
        this.partialLines = [];
        this.lines = [];
    }

    static addPoint(point) {
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
                Utilities.deleteArrayEntry(this.partialLines, point.line)
                Utilities.deleteArrayEntry(this.points, other);
                return;
            }
        }

        // oppsite isn't included
        this.points.push(point);
        this.partialLines.push(point.line)
        Utilities.deleteArrayEntry(File.currentLayer.lines, point.line)
    }

    static removePoint(point) {
        // opposite not selected
        for (let p of this.points) {
            if (p === point) {
                Utilities.deleteArrayEntry(this.points, point);
                Utilities.deleteArrayEntry(this.partialLines, point.line);
                File.currentLayer.lines.push(point.line);
                return;
            }
        }

        // opposite selected
        for (let l of this.lines) {
            if (l === point.line) {
                Utilities.deleteArrayEntry(this.lines, point.line);
                this.points.push(point.opposite);
                this.partialLines.push(point.line);
                return;
            }
        }
        File.currentLayer.cleanUpFile();
    }

    // TODO should check if point is already selected 
    //DONT USE
    static addLine(line) {
        console.log("Dangerous use!");
        this.lines.push(line);
        Utilities.deleteArrayEntry(File.currentLayer.lines, line);
        File.updateStats();
    }
    
    static clearSelection() {
        File.currentLayer.lines = File.currentLayer.lines.concat(this.lines);
        File.currentLayer.lines = File.currentLayer.lines.concat(this.partialLines);

        this.points = [];
        this.partialLines = [];
        this.lines = [];

        File.currentLayer.cleanUpFile();
    }

    static selectEverything() {
        this.clearSelection();
        this.lines = File.currentLayer.lines;
        File.currentLayer.lines = [];
    }

    static noSelection() {
        return this.points.length == 0 && this.partialLines.length == 0 && this.lines.length == 0;
    }

    static invertSelection() {
        let tmp = this.lines;
        this.lines = File.currentLayer.lines;
        File.currentLayer.lines = tmp;

        for (var i = 0; i < this.points.length; i++) {
            this.points[i] = this.points[i].opposite;
        }
        File.currentLayer.cleanUpFile();
    }

    static deleteSelection() {
        this.lines = [];
        this.partialLines = [];

        // TODO PERFORMANCE maybe use slice here, becaus 'deleteArrayEntry iterates over whole array for every delete...
        for (let point of this.points)
            Utilities.deleteArrayEntry(File.currentLayer.lines, point.line);

        this.points = [];
        File.updateStats();
    }

    static getAllSelectedPoints() {
        return Utilities.linesToLineEndings(this.lines).concat(this.points);
    }

    static isPointSelected(point) {
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

    static changeSelectionForPoints(points) {
        for (let p of points) {
            if (this.isPointSelected(p))
                this.removePoint(p);
            else
                this.addPoint(p);
        }
        File.currentLayer.cleanUpFile();
    }

    static getUnselectedPointsOfPartialLines() {
        let points = [];
        for (let p of this.points)
            points.push(p.opposite);

        return points;
    }
}