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
            if (LOGIC.currentState == StateEnum.BORDERSELECTION)
                this.drawHelpers();
            else if (grabInitializedWithKeyboard)
                this.drawHelpers2();
            this.drawBorderSelection();
        }

        this.drawObjects();

        if (!LOGIC.isPreviewing())
            this.drawPreciseSelection();

        if (LOGIC.currentState == StateEnum.IDLE, StateEnum.DRAWING) {
            this.drawPreview();
        }
    }

    drawGridLine(line, endpoint) {
        var startX;
        var startY;
        var endX;
        var endY;

        if (arguments.length == 1) {
            startX = line.start.x * SETTINGS.gridSize;
            startY = line.start.y * SETTINGS.gridSize;
            endX = line.end.x * SETTINGS.gridSize;
            endY = line.end.y * SETTINGS.gridSize;
        }
        else if (arguments.length == 2) {
            startX = line.x * SETTINGS.gridSize;
            startY = line.y * SETTINGS.gridSize;
            endX = endpoint.x * SETTINGS.gridSize;
            endY = endpoint.y * SETTINGS.gridSize;
        }

        startX += canvasOffset.x;
        startY += canvasOffset.y;
        endX += canvasOffset.x;
        endY += canvasOffset.y;

        if (arguments.length == 1) {
            var selectedPoints = line.SelectedPoints;
            if (selectedPoints == 0 || LOGIC.isPreviewing()) {
                context.strokeStyle = SETTINGS.lineColor;
                context.fillStyle = SETTINGS.lineColorFill;
            }
            else if (selectedPoints == 2) {
                context.strokeStyle = SETTINGS.selectionColor;
                context.fillStyle = SETTINGS.selectionColorFill;
            }
            else {
                let gradientStart;
                let gradientEnd;
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

                gradient.addColorStop(0, SETTINGS.selectionColorFill);
                gradient.addColorStop(1, SETTINGS.lineColorFill);

                context.strokeStyle = gradient;
                context.fillStyle = gradient;
            }
        }

        this.drawLineFromTo(startX, startY, endX, endY);

        if (!LOGIC.isPreviewing() && LINE_MANIPULATOR.showHandles) {
            this.drawCircle(startX, startY, SETTINGS.lineEndingRadius);
            this.drawCircle(endX, endY, SETTINGS.lineEndingRadius);
        }
    }

    drawGridPoint(screenpos) {
        var gridPoint = UTILITIES.getGridPos(screenpos);
        this.drawCircle(gridPoint.x * SETTINGS.gridSize + canvasOffset.x, gridPoint.y * SETTINGS.gridSize + canvasOffset.y, SETTINGS.gridPointSize);
    }


    drawGrid() // TODO grid class?
    {
        var size = SETTINGS.gridCellNumber * 0.5;

        for (var i = -size; i <= size; ++i) {
            if (i % SETTINGS.bigGridSize == 0) {
                context.lineWidth = 2;
                context.strokeStyle = SETTINGS.gridBigLineColor;

            }
            else if (Math.round(i % (SETTINGS.bigGridSize * 0.5) == 0)) {
                context.lineWidth = 2;
                context.strokeStyle = SETTINGS.gridLineColor;
            }
            else {
                context.lineWidth = 1;
                context.strokeStyle = SETTINGS.gridLineColor;

            }

            this.drawLineFromTo(
                -size * SETTINGS.gridSize + canvasOffset.x,
                i * SETTINGS.gridSize + canvasOffset.y,
                size * SETTINGS.gridSize + canvasOffset.x,
                i * SETTINGS.gridSize + canvasOffset.y
            );
            this.drawLineFromTo(
                i * SETTINGS.gridSize + canvasOffset.x,
                -size * SETTINGS.gridSize + canvasOffset.y,
                i * SETTINGS.gridSize + canvasOffset.x,
                size * SETTINGS.gridSize + canvasOffset.y
            );
        }

        context.lineWidth = 2;
        context.strokeStyle = 'darkred'; // TODO settings?

        this.drawLineFromTo(0, canvasOffset.y, canvas.width, canvasOffset.y);
        this.drawLineFromTo(canvasOffset.x, 0, canvasOffset.x, canvas.height);
    }

    drawObjects() {
        let objects = DATA_MANAGER.currentFile.lineObjects;

        context.lineWidth = SETTINGS.lineWidth;

        for (var i = 0; i < objects.length; i++) {
            if (objects[i] != DATA_MANAGER.currentFile.currentObject)
                // use transparent color;
                continue;

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

        context.strokeStyle = SETTINGS.previewLineColor;
        context.fillStyle = SETTINGS.previewLineColor;
        if (LOGIC.currentState == StateEnum.DRAWING) {
            var start = UTILITIES.getGridPos(MOUSE_HANDLER.downPoint);
            var end = currentGridPosition;//GetGridPos(vec2);
            context.lineWidth = SETTINGS.lineWidth;

            this.drawGridLine(start, end);
        }

        this.drawGridPoint(UTILITIES.gridpointToScreenpoint(currentGridPosition));
    }

    drawHelpers() {
        context.lineWidth = SETTINGS.helperLineWidth;
        context.strokeStyle = SETTINGS.helperColor;

        var screenpos = UTILITIES.gridpointToScreenpoint(currentGridPosition);
        this.drawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
        this.drawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
    }

    drawHelpers2() {
        context.lineWidth = SETTINGS.helperLineWidth;
        context.strokeStyle = SETTINGS.helperColor2;

        let screenpos = UTILITIES.gridpointToScreenpoint(currentGridPosition);

        let start = UTILITIES.gridpointToScreenpoint(KEYBOARD_HANDLER.grabStartPosition);
        this.drawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
        this.drawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
        this.drawLineFromTo(start.x, start.y, screenpos.x, screenpos.y);
    }

    drawBorderSelection() {
        if (LOGIC.currentState != StateEnum.BORDERSELECTION || !UTILITIES.borderSelectionStart || !UTILITIES.borderSelectionEnd)
            return;

        context.strokeStyle = SETTINGS.selectionColor;
        context.fillStyle = SETTINGS.borderSelectionColor;

        var leftTop = UTILITIES.gridpointToScreenpoint(UTILITIES.borderSelectionStart);
        var size = {
            x: (UTILITIES.borderSelectionEnd.x - UTILITIES.borderSelectionStart.x) * SETTINGS.gridSize,
            y: (UTILITIES.borderSelectionEnd.y - UTILITIES.borderSelectionStart.y) * SETTINGS.gridSize
        };

        context.rect(leftTop.x, leftTop.y, size.x, size.y);
        context.fillRect(leftTop.x, leftTop.y, size.x, size.y);
        context.stroke();
    }

    drawPreciseSelection() {

        let objects = DATA_MANAGER.currentFile.lineObjects;
        for (var i = 0; i < objects.length; i++) {
            let points = objects[i].getPreciseSelectionEntries();

            context.lineWidth = SETTINGS.preciseSelectionLineWidth;
            for (let j = 0; j < points.length; ++j) {
                context.fillStyle = (points[j].selected) ? SETTINGS.preciseSelectionSelectionColor : SETTINGS.preciseSelectionNoSelectionColor;
                context.strokeStyle = (points[j].selected) ? SETTINGS.selectionColor : SETTINGS.lineColor;

                this.drawCircle(points[j].x, points[j].y, SETTINGS.gridPointSize);
            }
        }
    }
}