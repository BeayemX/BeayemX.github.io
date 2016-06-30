class LineObject {
    constructor() {
        this.lines = [];
        this.color = new Color(0, 0, 0, 1);
        this.thickness = 1;
    }

    addLine(line) {
        if (cutLines)
            UTILITIES.cutLines(line, this.lines);
        else
            this.lines.push(line);

        GUI.writeToStatusbarRight("line added: " + line.toString());
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

        this.updateStats();
    }

    cleanUpFile() {
        // lines with length 0
        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.x == this.lines[i].end.x
                && this.lines[i].start.y == this.lines[i].end.y)
                this.removeLine(this.lines[i]);
        }

        // overlapping lines
        this.deletedLinesCounter = 0;
        for (var i = this.lines.length - 1; i >= 0; --i) {
            for (var j = this.lines.length - 1; j > i; --j) {
                if (this.lines[i].SelectedPoints == 0 &&
                    this.lines[j].SelectedPoints == 0 &&
                    this.linesOverlapping(this.lines[i], this.lines[j])) {
                    this.removeLine(this.lines[j]);
                    ++this.deletedLinesCounter;
                    continue;
                }
            }
        }
        this.updateStats();
    }

    updateStats() {
        var text = this.lines.length + " lines";

        if (this.deletedLinesCounter > 0) {
            // DRAW_MANAGER.redraw(); // TODO not sure if needed
            text += " (" + this.deletedLinesCounter + " cleaned up)";
        }

        GUI.writeToStatusbarRight(text); // SIFU TODO FOR FINAL BUILD COMMENT ME IN!!!
    }

    getAllSelectedPoints() {
        let points = [];

        for (let i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.selected)
                points.push(this.lines[i].start);
            if (this.lines[i].end.selected)
                points.push(this.lines[i].end);
        }

        return points;
    }


    getUnselectedLines() {
        let points = this.getAllSelectedPoints();
        let selectedLines = [];

        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.selected == false && this.lines[i].end.selected == false)
                selectedLines.push(this.lines[i]);
        }
        return selectedLines;
    }


    getSelectedLines() {
        let points = this.getAllSelectedPoints();
        let selectedLines = [];
        for (let i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.selected || this.lines[i].end.selected)
                selectedLines.push(this.lines[i]);
        }
        return selectedLines;
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

    selectAllPoints() {
        var allPoints = this.getAllPoints();
        UTILITIES.setSelectStateForPoints(allPoints, true);
    }

    clearSelection() {
        UTILITIES.setSelectStateForPoints(this.getAllSelectedPoints(), false);
        this.cleanUpFile();
    }

    getOtherPointBelongingToLine(point) {
        for (let i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start === point)
                return this.lines[i].end;

            else if (this.lines[i].end === point)
                return this.lines[i].start;
        }
    }

    deleteSelectedLines() {
        var points = this.getAllSelectedPoints();

        for (var i = points.length - 1; i >= 0; --i) {
            for (var j = this.lines.length - 1; j >= 0; --j) {
                if (this.lines[j].start == points[i]
                    || this.lines[j].end == points[i])
                    this.removeLine(this.lines[j])
            }
        }
    }

    isSomethingSelected() {
        for (var line of this.lines) {
            if (line.start.selected || line.end.selected)
                return true;
        }
        return false;
    }

    duplicateLines() {
        var selectedLines = this.getSelectedLines();
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
        let points = this.getAllSelectedPoints();

        if (points.length == 0)
            this.selectAllPoints();
        else
            this.clearSelection();
    }

    getAllPointsWithSelection(selection) {
        let points = [];
        for (let i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.selected == selection)
                points.push(this.lines[i].start);
            if (this.lines[i].end.selected == selection)
                points.push(this.lines[i].end);
        }
        return points;
    }

    getAllPoints() {
        let points = [];
        for (let i = 0; i < this.lines.length; ++i) {
            points.push(this.lines[i].start);
            points.push(this.lines[i].end);
        }
        return points;
    }

    linesOverlapping(line1, line2) { // SIFU TODO move to utilities? generll entweder in utilities oder ins line object aber nicht so halbherzig aufteilen
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

    invertSelection() {
        let points = this.getAllPoints();
        for (let i = 0; i < points.length; ++i) {
            points[i].selected = !points[i].selected;
        }
    }

    growSelection(redraw) {
        let selectedPoints = this.getAllSelectedPoints();
        let allSelectedPoints = [];

        for (let i = 0; i < selectedPoints.length; ++i)
            allSelectedPoints = allSelectedPoints.concat(this.getAllPointsAt(selectedPoints[i], 0.1)); // TODO magic number, should use Vector2.Equals-epsilon?

        for (let i = 0; i < allSelectedPoints.length; ++i) 
            allSelectedPoints[i].selected = true;

        for (let i = 0; i < allSelectedPoints.length; ++i) {
            let p = this.getOtherPointBelongingToLine(allSelectedPoints[i]);
            let pArray = this.getAllPointsAt(p, 0);

            for (let j = 0; j < pArray.length; ++j)
                pArray[j].selected = true;
        }

        if (redraw)
            DRAW_MANAGER.redraw();
    }

    selectLinked() {
        let selPointsNumOld = 0;
        let maxIterations = 30;

        for (var i = 0; i < maxIterations; i++) {
            this.growSelection(false);

            let selPointsNum = this.getAllSelectedPoints().length;

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