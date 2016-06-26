"use strict"

// TODO rename border select to area select
class Utilities {
    constructor() {
        this.borderSelectionStart = null;
        this.borderSelectionEnd = null;
        this.borderSelectType = null;
    }

    getMousePos(e) {
        let rect = canvas.getBoundingClientRect();
        return new Vector2(
		    e.clientX - rect.left,
		    e.clientY - rect.top
	    );
    }

    reloadPage(ask) {
        if (ask && confirm("Do you want to discard your LogoDesign?")
		    || !ask)
            location.reload();

    }

    deleteArrayEntry(array, entry) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i] == entry) {
                array.splice(i, 1);
            }
        }
    }

    setSelectStateForPoints(points, value)
    {
        for (var i = 0; i < points.length; ++i) {
            points[i].selected = value;
        }
    }

    changeSelectionForPoints(points) {
        for (var i = 0; i < points.length; ++i) {
            points[i].selected = !points[i].selected;
        }
    }

    movePointsBy(points, delta, createHistory) {
        for (let i = 0; i < points.length; ++i) {
            points[i].x += delta.x;
            points[i].y += delta.y;
        }

        if (arguments.length == 3) {
            if (delta.x != 0 || delta.y != 0) {
                let curr = currentPosition.copy();
                let start = KEYBOARD_HANDLER.grabStartPosition.copy();

                ACTION_HISTORY.PushAction(new MoveAction(points, curr, start));
            }
        }
    }

    startAreaSelection(selectType) {
        this.borderSelectType = selectType
        this.borderSelectionStart = currentPosition.copy();
        this.borderSelectionEnd = currentPosition.copy();
    }

    endAreaSelection(performSelection) {
        if (performSelection)
            this.selectWithinBorderSelection();

        this.borderSelectionStart = null;
        this.borderSelectionEnd = null;
        this.borderSelectType = null;

        LOGIC.setState(StateEnum.IDLE);

        DRAW_MANAGER.redraw();
    }

    selectWithinBorderSelection() {
        var points = DATA_MANAGER.currentFile.getAllPoints();

        var min = {
            x: Math.min(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.min(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };
        var max = {
            x: Math.max(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.max(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };

        for (var i = 0; i < points.length; ++i) {
            if (
                points[i].x >= min.x && points[i].x <= max.x
                &&
                points[i].y >= min.y && points[i].y <= max.y
                )
                points[i].selected = this.borderSelectType;
        }
    }

    getNearestSelection(canvasSpacePos) {
        let precisePoints = DATA_MANAGER.currentFile.getPreciseSelectionEntries();
        let screenSpacePos = DRAW_MANAGER.canvasSpaceToScreenSpace(canvasSpacePos);
        screenSpacePos.round();

        let minDistance = {
            index: -1,
            distance: Infinity
        };

        for (let i = 0; i < precisePoints.length; ++i) {
            let dist = Vector2.distance(precisePoints[i], screenSpacePos);

            if (dist < minDistance.distance) {
                minDistance.index = i;
                minDistance.distance = dist;
            }
        }

        if (minDistance.index != -1) {
            return [precisePoints[minDistance.index].point];
        }

        return DATA_MANAGER.currentFile.getAllPointsAt(canvasSpacePos, cursorRange);
    }

    calculateCenter(lines) {
        var min = new Vector2(Infinity, Infinity);
        var max = new Vector2(-Infinity, -Infinity);

        for (var line of lines) {
            min.x = Math.min(min.x, line.start.x);
            min.y = Math.min(min.y, line.start.y);
            max.x = Math.max(max.x, line.end.x);
            max.y = Math.max(max.y, line.end.y);
        }

        var center = new Vector2(
            Math.round((max.x + min.x) * 0.5),
            Math.round((max.y + min.y) * 0.5)
            );

        return center;
    }
}