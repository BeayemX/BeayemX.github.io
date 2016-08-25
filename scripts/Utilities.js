// TODO rename border select to area select
class Utilities {
    static init() {
        this.borderSelectionStart = null;
        this.borderSelectionEnd = null;
        this.borderSelectType = null;
    }

    static getMousePos(e) {
        let rect = canvas.getBoundingClientRect();
        return new Vector2(
		    e.clientX - rect.left,
		    e.clientY - rect.top
	    );
    }

    static deleteArrayEntry(array, entry) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i] == entry) {
                return array.splice(i, 1)[0];
            }
        }
        return null;
    }

    static movePointsBy(points, delta) {
        for (let i = 0; i < points.length; ++i) {
            points[i].position = points[i].position.addVector(delta);
        }
    }

    static moveSelectionBy(points, delta) {
        if (delta.x != 0 || delta.y != 0) {
            ActionHistory.PushAction(new MoveAction(points, delta));
        }
    }

    static startAreaSelection(selectType) {
        this.borderSelectType = selectType
        this.borderSelectionStart = selectionCursor.copy();
        this.borderSelectionEnd = selectionCursor.copy();
    }

    static endAreaSelection(performSelection) {
        if (performSelection)
            this.selectWithinBorderSelection();

        this.borderSelectionStart = null;
        this.borderSelectionEnd = null;
        this.borderSelectType = null;

        Logic.setState(StateEnum.IDLE);

        Renderer.redraw();
    }

    static selectWithinBorderSelection() {
        let points =
            this.borderSelectType
            ?
            File.currentLayer.getAllPoints().concat(Selection.getUnselectedPointsOfPartialLines())
            :
            Selection.getAllSelectedPoints();

        let min = {
            x: Math.min(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.min(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };
        let max = {
            x: Math.max(this.borderSelectionStart.x, this.borderSelectionEnd.x),
            y: Math.max(this.borderSelectionStart.y, this.borderSelectionEnd.y)
        };

        // TODO USE RECT / BOUND and within method
        for (let i = 0; i < points.length; ++i) {
            if (
                points[i].position.x >= min.x && points[i].position.x <= max.x
                &&
                points[i].position.y >= min.y && points[i].position.y <= max.y
                ) {
                if (this.borderSelectType)
                    Selection.addPoint(points[i]);
                else
                    Selection.removePoint(points[i]);
            }
        }
    }

    // TODO lines needed? i could always use points, maybe...
    static calculateCenter(lines, points) {
        let min = new Vector2(Infinity, Infinity);
        let max = new Vector2(-Infinity, -Infinity);

        if (lines != null){
            for (let line of lines) {
                min.x = Math.min(min.x, line.start.position.x);
                min.y = Math.min(min.y, line.start.position.y);
                max.x = Math.max(max.x, line.start.position.x);
                max.y = Math.max(max.y, line.start.position.y);

                min.x = Math.min(min.x, line.end.position.x);
                min.y = Math.min(min.y, line.end.position.y);
                max.x = Math.max(max.x, line.end.position.x);
                max.y = Math.max(max.y, line.end.position.y);
            }
        }

        for (let point of points) {
            min.x = Math.min(min.x, point.position.x);
            min.y = Math.min(min.y, point.position.y);
            max.x = Math.max(max.x, point.position.x);
            max.y = Math.max(max.y, point.position.y);
        }

        let center = new Vector2(
            Math.round((max.x + min.x) * 0.5),
            Math.round((max.y + min.y) * 0.5)
            );

        return center;
    }

    static snapSelectedPointsToGrid() {
        if (!showGrid)
            return;

        let selPoints = Selection.getAllSelectedPoints();

        for (let i = 0; i < selPoints.length; ++i)
            selPoints[i].position = GridManager.grid.getNearestPointFor(selPoints[i].position);

        Renderer.redraw();
    }

    static distancePointToLine(position, line) {
        let se = line.end.position.subtractVector(line.start.position);
        let sp = position.subtractVector(line.start.position);
        let ep = position.subtractVector(line.end.position);

        if (Vector2.dot(se, sp) <= 0)
            return sp.magnitude();
        if (Vector2.dot(se.flipped(), ep) <= 0)
            return ep.magnitude();
        return Math.abs((se.x * sp.y - se.y * sp.x) / se.magnitude());
    }

    static cutLines(cutter, lines, useDrawnLineAsRealLine) {
        let changedLines = [];
        let intersections = [];

        intersections.push(cutter.start.position.copy());
        this.addPointSorted(intersections, cutter.end.position.copy());

        let n = lines.length;

        for (let i = 0; i < n; i++) {
            let points = this.intersect(cutter, lines[i]);
            if (points.length == 1) {
                if (!points[0].equals(lines[i].end.position) && !points[0].equals(lines[i].start.position)) {

                    lines.push(new Line(points[0].copy(), lines[i].end.position.copy(),lines[i].color, lines[i].thickness));
                    lines[i].setEnd(points[0]);
                }
            }
            else if (points.length == 2)
                changedLines.push(i);

            for (let point of points)
                this.addPointSorted(intersections, point);
        }

        if (useDrawnLineAsRealLine) {
            for (let i = 0; i < intersections.length - 1; i++)
                lines.push(new Line(intersections[i].copy(), intersections[i + 1].copy()));
        }

        for (let i = lines.length - 1; i >= n; i--)
            for (let j of changedLines)
                if ((lines[i].start.position.equals(lines[j].start.position) && lines[i].end.position.equals(lines[j].end.position)) ||
                    (lines[i].start.position.equals(lines[j].end.position) && lines[i].end.position.equals(lines[j].start.position)))
                lines.splice(i + 1, 1);
    }

    static addPointSorted(points, point) {
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

    static intersect(line1, line2) {
        let points = [];
        let v1 = line1.end.position.subtractVector(line1.start.position);
        let v2 = line2.end.position.subtractVector(line2.start.position);
        let ls = -v1.y * (line1.start.position.x - line2.start.position.x) + v1.x * (line1.start.position.y - line2.start.position.y);
        let rs = -v2.x * v1.y + v1.x * v2.y;
        let lt = v2.x * (line1.start.position.y - line2.start.position.y) - v2.y * (line1.start.position.x - line2.start.position.x);
        let rt = -v2.x * v1.y + v1.x * v2.y;
        let s = ls / rs;
        let t = lt / rt;

        if (eq(ls, 0) && eq(rs, 0) && eq(lt, 0) && eq(rt, 0)) {
            let minX = Math.min(line1.start.position.x, line1.end.position.x, line2.start.position.x, line2.end.position.x);
            let minY = Math.min(line1.start.position.y, line1.end.position.y, line2.start.position.y, line2.end.position.y);
            let maxX = Math.max(line1.start.position.x, line1.end.position.x, line2.start.position.x, line2.end.position.x);
            let maxY = Math.max(line1.start.position.y, line1.end.position.y, line2.start.position.y, line2.end.position.y);
            if (Math.abs(maxX - minX) <= Math.abs(v1.x) + Math.abs(v2.x) &&
                Math.abs(maxY - minY) <= Math.abs(v1.y) + Math.abs(v2.y)) {
                let bounds = [];
                bounds.push(line1.start.position.copy());
                this.addPointSorted(bounds, line1.end.position.copy());
                this.addPointSorted(bounds, line2.start.position.copy());
                this.addPointSorted(bounds, line2.end.position.copy());
                points.push(bounds[1]);
                points.push(bounds[2]);
            }

            return points;
        }
        //float s = (-v1.y * (line1.start.position.x - line2.start.position.x) + v1.x * (line1.start.position.y - line2.start.position.y)) / (-v2.x * v1.y + v1.x * v2.y);
        //float t = (v2.x * (line1.start.position.y - line2.start.position.y) - v2.y * (line1.start.position.x - line2.start.position.x)) / (-v2.x * v1.y + v1.x * v2.y);
        // console.log("s = " + s + ", t = " + t + ", ls = " + ls + ", rs = " + rs + ", lt = " + lt + ", rt = " + rt);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
            points.push(new Vector2(line1.start.position.x + (t * v1.x), line1.start.position.y + (t * v1.y)));

        return points;
    }

    static linesToLineEndings(lines) {
        let points = [];
        for (let line of lines) {
            points.push(line.start);
            points.push(line.end);
        }
        return points;
    }

    static mergeSelectedPoints()
    {
        let endings = Selection.getAllSelectedPoints();
        let center = this.calculateCenter(null, endings);

        for (let ending of endings)
            ending.position = center.copy();

        Renderer.redraw();
    }
}

// TODO put into class
function eq(a, b) {
    let margin = 0.1;
    let diff = Math.abs(a - b)
    return diff < margin;
}