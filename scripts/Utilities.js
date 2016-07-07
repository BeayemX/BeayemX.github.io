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

    setSelectStateForPoints(points, value) {
        for (var i = 0; i < points.length; ++i) {
            points[i].selected = value;
        }
    }

    changeSelectionForPoints(points) {
        for (var i = 0; i < points.length; ++i) {
            points[i].selected = !points[i].selected;
        }
    }

    // SIFU FIXME TODO undo also snapps to grid which shouldn't happen if originally were subpixel values
    movePointsBy(points, delta, createHistory) {
        for (let i = 0; i < points.length; ++i) {
            points[i].setValues(points[i].addVector(delta));
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
        this.borderSelectionStart = selectionCursor.copy();
        this.borderSelectionEnd = selectionCursor.copy();
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
        let points = DATA_MANAGER.currentFile.getAllPoints();

        let min = {
            x: Math.min(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.min(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };
        let max = {
            x: Math.max(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.max(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };

        for (let i = 0; i < points.length; ++i) {
            if (
                points[i].x >= min.x && points[i].x <= max.x
                &&
                points[i].y >= min.y && points[i].y <= max.y
                )
                points[i].selected = this.borderSelectType;
        }
    }

    calculateCenter(lines) {
        let min = new Vector2(Infinity, Infinity);
        let max = new Vector2(-Infinity, -Infinity);

        for (let line of lines) {
            min.x = Math.min(min.x, line.start.x);
            min.y = Math.min(min.y, line.start.y);
            max.x = Math.max(max.x, line.end.x);
            max.y = Math.max(max.y, line.end.y);
        }

        let center = new Vector2(
            Math.round((max.x + min.x) * 0.5),
            Math.round((max.y + min.y) * 0.5)
            );

        return center;
    }

    snapSelectedPointsToGrid() {
        if (!showGrid)
            return;

        let selPoints = DATA_MANAGER.currentFile.getAllSelectedPoints();

        for (let i = 0; i < selPoints.length; ++i)
            selPoints[i].setValues(GRID.getNearestPointFor(selPoints[i]));

        DRAW_MANAGER.redraw();
    }

    distancePointToLine(point, line) {
        let se = line.end.subtractVector(line.start);
        let sp = point.subtractVector(line.start);
        let ep = point.subtractVector(line.end);

        if (Vector2.dot(se, sp) <= 0)
            return sp.magnitude();
        if (Vector2.dot(se.multiply(-1), ep) <= 0)
            return ep.magnitude();
        return Math.abs((se.x * sp.y - se.y * sp.x) / se.magnitude());
    }


    cutLines(cutter, lines) {
        let changedLines = [];
        let intersections = [];

        intersections.push(cutter.start.copy());
        this.addPointSorted(intersections, cutter.end.copy());

        let n = lines.length;

        for (let i = 0; i < n; i++) {
            let points = this.intersect(cutter, lines[i]);
            if (points.length == 1) {
                if (points[0] != lines[i].end && points[0] != lines[i].start) {

                    lines.push(new Line(points[0].copy(), lines[i].end.copy()));
                    lines[i].end = points[0].copy();
                }
            }
            else if (points.length == 2)
                changedLines.push(i);

            for (let point of points)
                this.addPointSorted(intersections, point);
        }

        for (let i = 0; i < intersections.length - 1; i++)
            lines.push(new Line(intersections[i].copy(), intersections[i + 1].copy()));

        for (let i = lines.length - 1; i >= n; i--)
            for (let j of changedLines)
                if ((lines[i].start.equals(lines[j].start) && lines[i].end.equals(lines[j].end)) ||
                    (lines[i].start.equals(lines[j].end) && lines[i].end.equals(lines[j].start)))
                lines.splice(i + 1, 1);
    }

    addPointSorted(points, point) {
        for (let i = 0; i < points.length; i++) {
            if (eq(point.y, points[i].y) && eq(point.x, points[i].x))
                return;
            if (point.x > points[i].x ||
                (eq(point.x, points[i].x) && point.y > points[i].y)) {
                points.splice(i, 0, point);
                return;
            }
        }
        points.push(point);
    }

    intersect(line1, line2) {
        let points = [];
        let v1 = line1.end.subtractVector(line1.start);
        let v2 = line2.end.subtractVector(line2.start);
        let ls = -v1.y * (line1.start.x - line2.start.x) + v1.x * (line1.start.y - line2.start.y);
        let rs = -v2.x * v1.y + v1.x * v2.y;
        let lt = v2.x * (line1.start.y - line2.start.y) - v2.y * (line1.start.x - line2.start.x);
        let rt = -v2.x * v1.y + v1.x * v2.y;
        let s = ls / rs;
        let t = lt / rt;

        if (eq(ls, 0) && eq(rs, 0) && eq(lt, 0) && eq(rt, 0)) {
            let minX = Math.min(line1.start.x, line1.end.x, line2.start.x, line2.end.x);
            let minY = Math.min(line1.start.y, line1.end.y, line2.start.y, line2.end.y);
            let maxX = Math.max(line1.start.x, line1.end.x, line2.start.x, line2.end.x);
            let maxY = Math.max(line1.start.y, line1.end.y, line2.start.y, line2.end.y);
            if (Math.abs(maxX - minX) <= Math.abs(v1.x) + Math.abs(v2.x) &&
                Math.abs(maxY - minY) <= Math.abs(v1.y) + Math.abs(v2.y)) {
                let bounds = [];
                bounds.push(line1.start.copy());
                this.addPointSorted(bounds, line1.end.copy());
                this.addPointSorted(bounds, line2.start.copy());
                this.addPointSorted(bounds, line2.end.copy());
                points.push(bounds[1]);
                points.push(bounds[2]);
                console.log(bounds);
            }

            return points;
        }
        //float s = (-v1.y * (line1.start.x - line2.start.x) + v1.x * (line1.start.y - line2.start.y)) / (-v2.x * v1.y + v1.x * v2.y);
        //float t = (v2.x * (line1.start.y - line2.start.y) - v2.y * (line1.start.x - line2.start.x)) / (-v2.x * v1.y + v1.x * v2.y);
        // console.log("s = " + s + ", t = " + t + ", ls = " + ls + ", rs = " + rs + ", lt = " + lt + ", rt = " + rt);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
            points.push(new Point(line1.start.x + (t * v1.x), line1.start.y + (t * v1.y)));

        return points;
    }
}

function eq(a, b)
{
    let margin = 0.1;
    let diff = Math.abs(a-b)
    return diff < margin;
}