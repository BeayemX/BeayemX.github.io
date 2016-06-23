"use strict"

// TODO rename border select to area select
class Utilities {
    constructor() {
        this.borderSelectionStart = null;
        this.borderSelectionEnd = null;
        this.borderSelectType = null;
    }

    getMousePos(e) {
        var rect = canvas.getBoundingClientRect();
        return new Vector2(
		    e.clientX - rect.left,
		    e.clientY - rect.top
	    );
    }
    /*

    getMousePosConsideringOffset(e) {
        var rect = canvas.getBoundingClientRect();
        return new Vector2(
		    e.clientX - rect.left - canvasOffset.x,
		    e.clientY - rect.top - canvasOffset.y
	    );
    }

    getGridPos(screenPos) // TODO rename to ScreenpointToGridpoint
    {
        var x = new GridPoint(
		    Math.round((screenPos.x - canvasOffset.x) / SETTINGS.gridSize),
		    Math.round((screenPos.y - canvasOffset.y) / SETTINGS.gridSize)
	    );
        return x;
    }
    //*/

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
                let curr = { x: currentPosition.x, y: currentPosition.y };
                let start = { x: KEYBOARD_HANDLER.grabStartPosition.x, y: KEYBOARD_HANDLER.grabStartPosition.y };
                ACTION_HISTORY.PushAction(new MoveAction(points, curr, start));
            }
        }
    }

    startAreaSelection(selectType) {
        this.borderSelectType = selectType
        this.borderSelectionStart = { x: currentPosition.x, y: currentPosition.y };
        this.borderSelectionEnd = { x: currentPosition.x, y: currentPosition.y };
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
            let dist = precisePoints[i].Distance(screenSpacePos);

            if (dist < minDistance.distance) {
                minDistance.index = i;
                minDistance.distance = dist;
            }
        }

        if (minDistance.index != -1) {
            return [precisePoints[minDistance.index].point];
        }

        console.log("when should this happen?, maybe old version where screenpoint was inside of the init-array?");
        return DATA_MANAGER.currentFile.getAllPointsAt(canvasSpacePos, 50);
    }

    toggleDevArea() {
        if (rightarea.style.visibility == "hidden")
            rightarea.style.visibility = "visible";
        else
            rightarea.style.visibility = "hidden";
        ResizeCanvas();
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