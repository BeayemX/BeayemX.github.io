class Layer {
    constructor() {
        this.lines = [];
        this.color = new Color(0, 0, 0, 1);
        this.thickness = 1;
        this.id = "New Layer";
        this.deletedLinesCounter = 0;
    }

    addLine(line) {
        if ((cutLines && !tmpCutLines) || (!cutLines && tmpCutLines)) // TODO should also change button text
            UTILITIES.cutLines(line, this.lines);
        else
            this.lines.push(line);

        GUI.notify(line.toString() + " added.");
        this.cleanUpFile();
    }

    addLines(duplLines) {
        this.lines = this.lines.concat(duplLines);
        this.cleanUpFile();
    }

    removeLine(line) { // SIFU TODO difference to deleteSelectedLine? just the parameter? could get selected and pass as parameter?
        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i] == line) {
                this.lines.splice(i, 1);
                break; // TODO passt das?
            }
        }

        FILE.updateStats();
    }

    cleanUpFile() {
        // lines with length 0
        for (var i = this.lines.length - 1; i >= 0; --i) {
            if (this.lines[i].start.x == this.lines[i].end.x
                && this.lines[i].start.y == this.lines[i].end.y)
                this.removeLine(this.lines[i]);
        }

        // overlapping lines
        this.deletedLinesCounter = 0;
        for (var i = this.lines.length - 1; i >= 0; --i) {
            for (var j = this.lines.length - 1; j > i; --j) {
                if (Line.overlapping(this.lines[i], this.lines[j])) {
                    this.removeLine(this.lines[j]);
                    ++this.deletedLinesCounter;
                    continue;
                }
            }
        }

        FILE.updateStats();
    }

    updateStats() {
        if (this.deletedLinesCounter > 0)
            GUI.notify("Cleaned up " + this.deletedLinesCounter + " lines.");
    }
    
    getAllPointsAt(clickPoint, withinRadius) {
        let points = [];
        for (let i = 0; i < this.lines.length; ++i) {
            //console.log(this.pointWithinCircle(this.lines[i].start, clickPoint, withinRadius));
            if (this.pointWithinCircle(this.lines[i].start, clickPoint, withinRadius))
                points.push(this.lines[i].start);
            if (this.pointWithinCircle(this.lines[i].end, clickPoint, withinRadius))
                points.push(this.lines[i].end);
        }
        return points;
    }

    pointWithinCircle(p, center, radius) {
        return Vector2.distance(p, center) <= radius;
    }

    duplicateLines() {
        var selectedLines = SELECTION.selectedLines;
        var duplLines = [];
        for (var i = 0; i < selectedLines.length; ++i) {
            duplLines.push(new Line(
                selectedLines[i].start.x,
                selectedLines[i].start.y,
                selectedLines[i].end.x,
                selectedLines[i].end.y
                ));
        }
        this.addLines(duplLines);
    }

    selectAllToggle() {
        if (SELECTION.noSelection())
            SELECTION.selectEverything();
        else
            SELECTION.clearSelection();
    }

    // TODO replace me with method in return line
    getAllPoints() {
        return UTILITIES.linesToPoints(FILE.currentLayer.lines);
    }

    growSelection(redraw) {
        let selectedPoints = SELECTION.getAllSelectedPoints();
        let allSelectedPoints = [];

        for (let i = 0; i < selectedPoints.length; ++i)
            allSelectedPoints = allSelectedPoints.concat(this.getAllPointsAt(selectedPoints[i], 0.1)); // TODO magic number, should use Vector2.Equals-epsilon?

        for (let i = 0; i < allSelectedPoints.length; ++i)
            SELECTION.addPoint(allSelectedPoints[i]);

        for (let i = 0; i < allSelectedPoints.length; ++i) {
            let p = allSelectedPoints[i].opposite;
            let pArray = this.getAllPointsAt(p, 0);

            for (let j = 0; j < pArray.length; ++j)
                SELECTION.addPoint(pArray[j]);
        }

        if (redraw)
            DRAW_MANAGER.redraw();
    }

    selectLinked() {
        let selPointsNumOld = 0;
        let maxIterations = 30;

        for (var i = 0; i < maxIterations; i++) {
            this.growSelection(false);

            let selPointsNum = SELECTION.getAllSelectedPoints().length;

            if (selPointsNumOld == selPointsNum)
                break;
            else
                selPointsNumOld = selPointsNum;
        }
        if (i == maxIterations)
            GUI.notify("Max Iteration Depth reached!");

        DRAW_MANAGER.redraw();
    }
}