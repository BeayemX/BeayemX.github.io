// SIFU TODO merge with Utilities?
// TODO if not other file name
class LineManipulator {

    static init() {
        console.log("LineManipulator created.");
        this.showHandles = true;
    }

    static subdivide() {
        var selectedLines = Selection.lines;
        var newLines = [];
        for (var i = 0; i < selectedLines.length; ++i) {
            let midPoint = selectedLines[i].end.position.addVector(selectedLines[i].start.position).multiply(0.5);

            newLines.push(new Line(selectedLines[i].start.position.x, selectedLines[i].start.position.y, midPoint.x, midPoint.y, selectedLines[i].color, selectedLines[i].thickness));
            newLines.push(new Line(midPoint.x, midPoint.y, selectedLines[i].end.position.x, selectedLines[i].end.position.y, selectedLines[i].color, selectedLines[i].thickness));
        }
        Selection.lines = [];
        Selection.lines = newLines;
        Renderer.redraw();
    }

    static mirror() {
        var minX = Infinity;
        var maxX = -Infinity;
        var selLines = Selection.lines;

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
        Renderer.redraw();
    }

    static rotate(clockwise) {
        let minX = Infinity;
        let minY = Infinity;
        let selLines = Selection.lines;

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
        Renderer.redraw();
    }

    static increaseSize(factor) {
        let selLines = Selection.lines;
        let selPoints= Selection.points;
        let center = Utilities.calculateCenter(selLines, selPoints);

        for (let line of selLines) {
            line.start.position = line.start.position.multiply(factor);
            line.end.position = line.end.position.multiply(factor);
        }

        for (let point of selPoints) 
            point.position = point.position.multiply(factor);


        let newCenter = Utilities.calculateCenter(selLines, selPoints);
        let delta = center.subtractVector(newCenter); 

        let points = Selection.getAllSelectedPoints();
        Utilities.movePointsBy(points, delta);
        //File.cleanUpFile();
        Renderer.redraw();
    }

    static growSelection() {
        File.growSelection(true);
    }

    static selectLinked() {
        File.selectLinked();
    }
}