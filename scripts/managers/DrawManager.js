class DrawManager {
    constructor() {
        console.log("DrawManager created.");
    }

    drawLineFromTo(x1, y1, x2, y2) {
        context.beginPath();
        if (arguments.length == 2) {
            context.moveTo(x1.x, x1.y);
            context.lineTo(y1.x, y1.y);
        }
        else if (arguments.length == 4) {
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
        }
        context.stroke();
    }

    drawCircle(centerX, centerY, radius) {
        context.beginPath();
        context.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        context.stroke();
        context.fill();
    }

    redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (!LOGIC.isPreviewing()) {
            this.drawGrid();
            if (LOGIC.isState(StateEnum.BORDERSELECTION))
                this.drawHelpers();
            else if (grabInitializedWithKeyboard)
                this.drawHelpers2();
            this.drawBorderSelection();
        }

        this.drawObjects();

        if (!LOGIC.isPreviewing())
            this.drawPreciseSelection();

        if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.DRAWING) {
            this.drawPreview();
        }
    }

    drawGridLine(line, endpoint) {
        var startX;
        var startY;
        var endX;
        var endY;

        if (arguments.length == 1) {
            startX = line.start.x * gridSize;
            startY = line.start.y * gridSize;
            endX = line.end.x * gridSize;
            endY = line.end.y * gridSize;
        }
        else if (arguments.length == 2) {
            startX = line.x * gridSize;
            startY = line.y * gridSize;
            endX = endpoint.x * gridSize;
            endY = endpoint.y * gridSize;
        }

        startX += canvasOffset.x;
        startY += canvasOffset.y;
        endX += canvasOffset.x;
        endY += canvasOffset.y;

        if (arguments.length == 1) {
            var selectedPoints = line.SelectedPoints;
            if (selectedPoints == 0 || LOGIC.isPreviewing()) {
                context.strokeStyle = lineColor;
                context.fillStyle = lineColorFill;
            }
            else if (selectedPoints == 2) {
                context.strokeStyle = selectionColor;
                context.fillStyle = selectionColorFill;
            }
            else {
                var gradientStart;
                var gradientEnd;
                if (line.start.selected) {
                    gradientStart = line.start;
                    gradientEnd = line.end;
                }
                else {
                    gradientStart = line.end;
                    gradientEnd = line.start;
                }
                var gradient = context.createLinearGradient(
                    UTILITIES.gridpointToScreenpoint(gradientStart).x,
                    UTILITIES.gridpointToScreenpoint(gradientStart).y,
                    UTILITIES.gridpointToScreenpoint(gradientEnd).x,
                    UTILITIES.gridpointToScreenpoint(gradientEnd).y);

                gradient.addColorStop(0, selectionColorFill);
                gradient.addColorStop(1, lineColorFill);

                context.strokeStyle = gradient;
                context.fillStyle = gradient;
            }
        }

        this.drawLineFromTo(startX, startY, endX, endY);

        if (!LOGIC.isPreviewing() && LINE_MANIPULATOR.showHandles) {
            this.drawCircle(startX, startY, lineEndingRadius);
            this.drawCircle(endX, endY, lineEndingRadius);
        }
    }

    drawGridPoint(screenpos) {
        var gridPoint = UTILITIES.getGridPos(screenpos);
        this.drawCircle(gridPoint.x * gridSize + canvasOffset.x, gridPoint.y * gridSize + canvasOffset.y, gridPointSize);
    }


    drawGrid() // TODO grid class?
    {
        var size = gridCellNumber * 0.5;

        for (var i = -size; i <= size; ++i) {
            if (i % bigGridSize == 0) {
                context.lineWidth = 2;
                context.strokeStyle = gridBigLineColor;

            }
            else if (Math.round(i % (bigGridSize * 0.5) == 0)) {
                context.lineWidth = 2;
                context.strokeStyle = gridLineColor;
            }
            else {
                context.lineWidth = 1;
                context.strokeStyle = gridLineColor;

            }

            this.drawLineFromTo(
                -size * gridSize + canvasOffset.x,
                i * gridSize + canvasOffset.y,
                size * gridSize + canvasOffset.x,
                i * gridSize + canvasOffset.y
            );
            this.drawLineFromTo(
                i * gridSize + canvasOffset.x,
                -size * gridSize + canvasOffset.y,
                i * gridSize + canvasOffset.x,
                size * gridSize + canvasOffset.y
            );
        }

        context.lineWidth = 2;
        context.strokeStyle = 'darkred';

        this.drawLineFromTo(0, canvasOffset.y, canvas.width, canvasOffset.y);
        this.drawLineFromTo(canvasOffset.x, 0, canvasOffset.x, canvas.height);
    }

    drawObjects() {
        context.lineWidth = lineWidth;
        let objects = DATA_MANAGER.currentFile.objects;
        for (var i = 0; i < objects.length; i++) {
            let unselLines = objects[i].getUnselectedLines();
            let selLines = objects[i].getSelectedLines();

            for (let line of unselLines)
                this.drawGridLine(line);
            for (let line of selLines)
                this.drawGridLine(line);
        }
    }

    drawPreview() {
        //DrawHelpers();

        context.strokeStyle = previewLineColor;
        context.fillStyle = previewLineColor;
        if (LOGIC.currentState == StateEnum.DRAWING) {
            var start = UTILITIES.getGridPos(MOUSE_HANDLER.downPoint);
            var end = currentGridPosition;//GetGridPos(vec2);
            context.lineWidth = lineWidth;

            this.drawGridLine(start, end);
        }

        this.drawGridPoint(UTILITIES.gridpointToScreenpoint(currentGridPosition));
    }

    drawHelpers() {
        context.lineWidth = helperLineWidth;
        context.strokeStyle = helperColor;

        var screenpos = UTILITIES.gridpointToScreenpoint(currentGridPosition);
        this.drawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
        this.drawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
    }

    drawHelpers2() {
        context.lineWidth = helperLineWidth;
        context.strokeStyle = helperColor2;

        let screenpos = UTILITIES.gridpointToScreenpoint(currentGridPosition);

        let start = UTILITIES.gridpointToScreenpoint(KEYBOARD_HANDLER.grabStartPosition);
        this.drawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
        this.drawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
        this.drawLineFromTo(start.x, start.y, screenpos.x, screenpos.y);
    }

    drawBorderSelection() {
        if (LOGIC.currentState != StateEnum.BORDERSELECTION || !UTILITIES.borderSelectionStart || !UTILITIES.borderSelectionEnd)
            return;

        context.strokeStyle = selectionColor;
        context.fillStyle = borderSelectionColor;

        var leftTop = UTILITIES.gridpointToScreenpoint(UTILITIES.borderSelectionStart);
        var size = {
            x: (UTILITIES.borderSelectionEnd.x - UTILITIES.borderSelectionStart.x) * gridSize,
            y: (UTILITIES.borderSelectionEnd.y - UTILITIES.borderSelectionStart.y) * gridSize
        };

        context.rect(leftTop.x, leftTop.y, size.x, size.y);
        context.fillRect(leftTop.x, leftTop.y, size.x, size.y);
        context.stroke();
    }

    drawPreciseSelection() {

        let objects = DATA_MANAGER.currentFile.objects;
        for (var i = 0; i < objects.length; i++) {
            let points = objects[i].getPreciseSelectionEntries();

            context.lineWidth = preciseSelectionLineWidth;
            for (let j = 0; j < points.length; ++j) {
                context.fillStyle = (points[j].selected) ? preciseSelectionSelectionColor : preciseSelectionNoSelectionColor;
                context.strokeStyle = (points[j].selected) ? selectionColor : lineColor;

                this.drawCircle(points[j].x, points[j].y, gridPointSize);
            }
        }
    }
}