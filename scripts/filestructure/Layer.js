class Layer {
    constructor() {
        this.lines = [];
        this.name = "New Layer";
        this.visible = true;
    }

    addLine(line) {
        if (tmpCutLines) {
            Selection.clearSelection();
            Utilities.cutLines(line, this.lines, false);
        }
        else if (cutLines) {
            Selection.clearSelection();
            Utilities.cutLines(line, this.lines, true);
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

        File.updateStats();
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
        File.updateStats();
    }

    getAllPointsAt(clickPoint, withinRadius) {
        let points = [];
        let lines = this.lines.concat(Selection.partialLines); // TODO maybe put function in other file? not sure if this should be in Layer...
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
        var selectedLines = Selection.lines.concat(Selection.partialLines);
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
        if (Selection.noSelection())
            Selection.selectEverything();
        else
            Selection.clearSelection();
    }

    // TODO replace me with method in return line
    getAllPoints() {
        return Utilities.linesToLineEndings(File.currentLayer.lines);
    }

    growSelection(redraw) {
        let selectedPoints = Selection.getAllSelectedPoints();
        let allSelectedPoints = [];

        for (let i = 0; i < selectedPoints.length; ++i)
            allSelectedPoints = allSelectedPoints.concat(this.getAllPointsAt(selectedPoints[i].position, 0.1)); // TODO magic number, should use Vector2.Equals-epsilon?

        for (let i = 0; i < allSelectedPoints.length; ++i)
            Selection.addPoint(allSelectedPoints[i]);

        for (let i = 0; i < allSelectedPoints.length; ++i) {
            let p = allSelectedPoints[i].opposite;
            let pArray = this.getAllPointsAt(p.position, 0);

            for (let j = 0; j < pArray.length; ++j)
                Selection.addPoint(pArray[j]);
        }

        if (redraw)
            Renderer.redraw();
    }

    selectLinked() {
        let selPointsNumOld = 0;
        let maxIterations = 30;

        for (var i = 0; i < maxIterations; i++) {
            this.growSelection(false);

            let selPointsNum = Selection.getAllSelectedPoints().length;

            if (selPointsNumOld == selPointsNum)
                break;
            else
                selPointsNumOld = selPointsNum;
        }
        if (i == maxIterations)
            GUI.notify("Max Iteration Depth reached!");

        Renderer.redraw();
    }
}