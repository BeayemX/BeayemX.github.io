﻿class LineObject {
    constructor() {
        this.lines = [];
    }

    addLine(line) {
        this.lines.push(line);
        this.cleanUpFile();
    }

    addLines(duplLines) {
        this.lines = this.lines.concat(duplLines);
        this.cleanUpFile();
    }

    removeLine(line) { // TODO difference to deleteSelectedLine? just the parameter? could get selected and pass as parameter?
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

        GUI.writeToStatusbarRight(text);
    }

    getAllSelectedPoints() {
        let points = [];

        for (var i = 0; i < this.lines.length; ++i) {
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


    getAllPointsAt(gridpoint) {
        var points = [];
        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.x == gridpoint.x && this.lines[i].start.y == gridpoint.y)
                points.push(this.lines[i].start);
            else if (this.lines[i].end.x == gridpoint.x && this.lines[i].end.y == gridpoint.y)
                points.push(this.lines[i].end);
        }
        return points;
    }

    getPreciseSelectionEntries() {
        var points = this.getAllPointsAt(currentGridPosition);
        var screenPos = UTILITIES.gridpointToScreenpoint(currentGridPosition);
        var precisePoints = [screenPos];

        if (points.length <= 1 || !showAdvancedHandles)
            return precisePoints

        for (var i = 0; i < points.length; ++i) {
            var otherPoint = this.getOtherPointBelongingToLine(points[i]);
            var direction = new Vector2(
                otherPoint.x - points[i].x,
                otherPoint.y - points[i].y);

            direction.Normalize();

            var preciseRadius = gridSize * 0.5 - gridPointSize * 2;
            var precisePoint = new PrecisePoint(
                screenPos.x + direction.x * preciseRadius,
                screenPos.y + direction.y * preciseRadius,
                points[i].selected,
                points[i]
            );

            precisePoints.push(precisePoint);
        }
        return precisePoints;
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
        for (var i = 0; i < this.lines.length; ++i) {
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

    getAllPoints() {
        var points = [];
        for (var i = 0; i < this.lines.length; ++i) {
            points.push(this.lines[i].start);
            points.push(this.lines[i].end);
        }
        return points;
    }

    linesOverlapping(line1, line2) { // TODO move to utilities?
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
            allSelectedPoints = allSelectedPoints.concat(this.getAllPointsAt(selectedPoints[i]));

        for (let i = 0; i < allSelectedPoints.length; ++i) {
            let p = this.getOtherPointBelongingToLine(allSelectedPoints[i]);
            let pArray = this.getAllPointsAt(p);

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