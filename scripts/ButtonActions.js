// SIFU TODO merge with Utilities?
// TODO if not other file name
class LineManipulator {

    constructor() {
        console.log("LineManipulator created.");
        this.showHandles = true;
    }

    subdivide() {
        var selectedLines = DATA_MANAGER.currentFile.getSelectedLines();
        for (var i = 0; i < selectedLines.length; ++i) {
            var midPoint =
            {
                x: Math.round((selectedLines[i].end.x + selectedLines[i].start.x) / 2),
                y: Math.round((selectedLines[i].end.y + selectedLines[i].start.y) / 2)
            }
            DATA_MANAGER.currentFile.addLine(new Line(selectedLines[i].start.x, selectedLines[i].start.y, midPoint.x, midPoint.y, true));
            DATA_MANAGER.currentFile.addLine(new Line(midPoint.x, midPoint.y, selectedLines[i].end.x, selectedLines[i].end.y, true));
            DATA_MANAGER.currentFile.removeLine(selectedLines[i]);
        }
        DRAW_MANAGER.redraw();
    }

    mirror() {
        var minX = Infinity;
        var maxX = -Infinity;
        var selLines = DATA_MANAGER.currentFile.getSelectedLines();

        for (var i = 0; i < selLines.length; ++i) {
            minX = Math.min(minX, selLines[i].start.x);
            maxX = Math.max(maxX, selLines[i].start.x);

            minX = Math.min(minX, selLines[i].end.x);
            maxX = Math.max(maxX, selLines[i].end.x);
        }

        for (var i = 0; i < selLines.length; ++i) {
            selLines[i].start.x -= (selLines[i].start.x - minX) * 2 - (maxX - minX);
            selLines[i].end.x -= (selLines[i].end.x - minX) * 2 - (maxX - minX);
        }
        DRAW_MANAGER.redraw();
    }

    rotate(clockwise) {
        let minX = Infinity;
        let minY = Infinity;
        let selLines = DATA_MANAGER.currentFile.getSelectedLines();

        for (let i = 0; i < selLines.length; ++i) {
            minX = Math.min(minX, selLines[i].start.x);
            minY = Math.min(minY, selLines[i].start.y);

            minX = Math.min(minX, selLines[i].end.x);
            minY = Math.min(minY, selLines[i].end.y);
        }

        for (let i = 0; i < selLines.length; ++i) {
            let tmp = selLines[i].start.x;
            selLines[i].start.x = selLines[i].start.y;
            selLines[i].start.y = tmp;

            if (clockwise)
                selLines[i].start.x = -selLines[i].start.x
            else
                selLines[i].start.y = -selLines[i].start.y

            tmp = selLines[i].end.x;
            selLines[i].end.x = selLines[i].end.y;
            selLines[i].end.y = tmp;

            if (clockwise)
                selLines[i].end.x = -selLines[i].end.x
            else
                selLines[i].end.y = -selLines[i].end.y
        }

        let newMinX = Infinity;
        let newMinY = Infinity;

        for (let i = 0; i < selLines.length; ++i) {
            newMinX = Math.min(newMinX, selLines[i].start.x);
            newMinY = Math.min(newMinY, selLines[i].start.y);

            newMinX = Math.min(newMinX, selLines[i].end.x);
            newMinY = Math.min(newMinY, selLines[i].end.y);
        }

        for (let i = 0; i < selLines.length; ++i) {
            selLines[i].start.x += minX - newMinX;
            selLines[i].start.y += minY - newMinY;
            selLines[i].end.x += minX - newMinX;
            selLines[i].end.y += minY - newMinY;
        }
        DRAW_MANAGER.redraw();
    }

    increaseSize(factor) {
        let selLines = DATA_MANAGER.currentFile.getSelectedLines();
        let center = UTILITIES.calculateCenter(selLines);

        for (let line of selLines)
        {
            line.start.x = line.start.x * factor;
            line.start.y = line.start.y * factor;
            line.end.x = line.end.x * factor;
            line.end.y = line.end.y * factor;
        }

        let newCenter = UTILITIES.calculateCenter(selLines);
        let delta = new Vector2(center.x - newCenter.x,
            center.y - newCenter.y);

        let points = DATA_MANAGER.currentFile.getAllSelectedPoints();
        UTILITIES.movePointsBy(points, delta)
        DATA_MANAGER.currentFile.cleanUpFile();
        DRAW_MANAGER.redraw();
    }

    growSelection() {
        DATA_MANAGER.currentFile.growSelection(true);
    }

    selectLinked() {
        DATA_MANAGER.currentFile.selectLinked();
    }
}