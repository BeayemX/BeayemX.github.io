class Layer {
    constructor() {
        this.lines = [];
        this.color = new Color(0, 0, 0, 1);
        this.thickness = 1;
        this.id = "New Layer";
        this.visible = true;
    }

    addLine(line) {
        if (tmpCutLines) {
            SELECTION.clearSelection();
            UTILITIES.cutLines(line, this.lines, false);
        }
        else if (cutLines) {
            SELECTION.clearSelection();
            UTILITIES.cutLines(line, this.lines, true);
        }
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
        let deletedLinesCounter = 0;
        // lines with length 0
        for (let i = this.lines.length - 1; i >= 0; --i) {
            if (this.lines[i].start.position.x == this.lines[i].end.position.x
                && this.lines[i].start.position.y == this.lines[i].end.position.y) {
                this.removeLine(this.lines[i]);
                ++deletedLinesCounter;
            }
        }

        // overlapping lines
        for (let i = this.lines.length - 1; i >= 0; --i) {
            for (var j = this.lines.length - 1; j > i; --j) {
                if (Line.overlapping(this.lines[i], this.lines[j])) {
                    this.removeLine(this.lines[j]);
                    ++deletedLinesCounter;
                    continue;
                }
            }
        }

        if (deletedLinesCounter > 0)
            GUI.notify("Cleaned up " + deletedLinesCounter + " lines.");
        FILE.updateStats();
    }

    getAllPointsAt(clickPoint, withinRadius) {
        let points = [];
        let lines = this.lines.concat(SELECTION.partialLines); // TODO maybe put function in other file? not sure if this should be in Layer...
        for (let i = 0; i < lines.length; ++i) {
            //console.log(this.pointWithinCircle(this.lines[i].start, clickPoint, withinRadius));
            if (this.pointWithinCircle(lines[i].start.position, clickPoint, withinRadius))
                points.push(lines[i].start);
            if (this.pointWithinCircle(lines[i].end.position, clickPoint, withinRadius))
                points.push(lines[i].end);
        }
        return points;
    }

    pointWithinCircle(p, center, radius) {
        return Vector2.distance(p, center) <= radius;
    }

    duplicateLines() {
        var selectedLines = SELECTION.lines.concat(SELECTION.partialLines);
        var duplLines = [];
        for (var i = 0; i < selectedLines.length; ++i) {
            duplLines.push(new Line(
                selectedLines[i].start.position.x,
                selectedLines[i].start.position.y,
                selectedLines[i].end.position.x,
                selectedLines[i].end.position.y
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
        return UTILITIES.linesToLineEndings(FILE.currentLayer.lines);
    }

    growSelection(redraw) {
        let selectedPoints = SELECTION.getAllSelectedPoints();
        let allSelectedPoints = [];

        for (let i = 0; i < selectedPoints.length; ++i)
            allSelectedPoints = allSelectedPoints.concat(this.getAllPointsAt(selectedPoints[i].position, 0.1)); // TODO magic number, should use Vector2.Equals-epsilon?

        for (let i = 0; i < allSelectedPoints.length; ++i)
            SELECTION.addPoint(allSelectedPoints[i]);

        for (let i = 0; i < allSelectedPoints.length; ++i) {
            let p = allSelectedPoints[i].opposite;
            let pArray = this.getAllPointsAt(p.position, 0);

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