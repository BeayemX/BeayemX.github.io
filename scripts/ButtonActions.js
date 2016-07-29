// SIFU TODO merge with Utilities?
// TODO if not other file name
class LineManipulator {

    constructor() {
        console.log("LineManipulator created.");
        this.showHandles = true;
    }

    subdivide() {
        var selectedLines = SELECTION.lines;
        var newLines = [];
        for (var i = 0; i < selectedLines.length; ++i) {
            let midPoint = selectedLines[i].end.position.addVector(selectedLines[i].start.position).multiply(0.5);

            newLines.push(new Line(selectedLines[i].start.position.x, selectedLines[i].start.position.y, midPoint.x, midPoint.y));
            newLines.push(new Line(midPoint.x, midPoint.y, selectedLines[i].end.position.x, selectedLines[i].end.position.y));
        }
        SELECTION.lines = [];
        SELECTION.lines = newLines;
        DRAW_MANAGER.redraw();
    }

    mirror() {
        var minX = Infinity;
        var maxX = -Infinity;
        var selLines = SELECTION.lines;

        for (var i = 0; i < selLines.length; ++i) {
            minX = Math.min(minX, selLines[i].start.position.x);
            maxX = Math.max(maxX, selLines[i].start.position.x);

            minX = Math.min(minX, selLines[i].end.position.x);
            maxX = Math.max(maxX, selLines[i].end.position.x);
        }

        for (var i = 0; i < selLines.length; ++i) {
            selLines[i].start.position.x -= (selLines[i].start.position.x - minX) * 2 - (maxX - minX);
            selLines[i].end.position.x -= (selLines[i].end.position.x - minX) * 2 - (maxX - minX);
        }
        DRAW_MANAGER.redraw();
    }

    rotate(clockwise) {
        let minX = Infinity;
        let minY = Infinity;
        let selLines = SELECTION.lines;

        for (let i = 0; i < selLines.length; ++i) {
            minX = Math.min(minX, selLines[i].start.position.x);
            minY = Math.min(minY, selLines[i].start.position.y);

            minX = Math.min(minX, selLines[i].end.position.x);
            minY = Math.min(minY, selLines[i].end.position.y);
        }

        for (let i = 0; i < selLines.length; ++i) {
            let tmp = selLines[i].start.position.x;
            selLines[i].start.position.x = selLines[i].start.position.y;
            selLines[i].start.position.y = tmp;

            if (clockwise)
                selLines[i].start.position.x = -selLines[i].start.position.x
            else
                selLines[i].start.position.y = -selLines[i].start.position.y

            tmp = selLines[i].end.position.x;
            selLines[i].end.position.x = selLines[i].end.position.y;
            selLines[i].end.position.y = tmp;

            if (clockwise)
                selLines[i].end.position.x = -selLines[i].end.position.x
            else
                selLines[i].end.position.y = -selLines[i].end.position.y
        }

        let newMinX = Infinity;
        let newMinY = Infinity;

        for (let i = 0; i < selLines.length; ++i) {
            newMinX = Math.min(newMinX, selLines[i].start.position.x);
            newMinY = Math.min(newMinY, selLines[i].start.position.y);

            newMinX = Math.min(newMinX, selLines[i].end.position.x);
            newMinY = Math.min(newMinY, selLines[i].end.position.y);
        }

        for (let i = 0; i < selLines.length; ++i) {
            selLines[i].start.position.x += minX - newMinX;
            selLines[i].start.position.y += minY - newMinY;
            selLines[i].end.position.x += minX - newMinX;
            selLines[i].end.position.y += minY - newMinY;
        }
        DRAW_MANAGER.redraw();
    }

    increaseSize(factor) {
        let selLines = SELECTION.lines;
        let selPoints= SELECTION.points;
        let center = UTILITIES.calculateCenter(selLines, selPoints);

        for (let line of selLines) {
            line.start.position = line.start.position.multiply(factor);
            line.end.position = line.end.position.multiply(factor);
        }

        for (let point of selPoints) 
            point.position = point.position.multiply(factor);


        let newCenter = UTILITIES.calculateCenter(selLines, selPoints);
        let delta = center.subtractVector(newCenter); 

        let points = SELECTION.getAllSelectedPoints();
        UTILITIES.movePointsBy(points, delta);
        //FILE.cleanUpFile();
        DRAW_MANAGER.redraw();
    }

    growSelection() {
        FILE.growSelection(true);
    }

    selectLinked() {
        FILE.selectLinked();
    }
}