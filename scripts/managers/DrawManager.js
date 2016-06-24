class DrawManager {
    constructor() {
        console.log("DrawManager created.");
    }

    drawLineFromTo(p1, p2, thickness, color, screenSpace, screenSpaceThickness) {
        p1 = p1.copy();
        p2 = p2.copy();

        if (!screenSpace) {
            p1.x += canvasOffset.x;
            p1.y += canvasOffset.y;
            p2.x += canvasOffset.x;
            p2.y += canvasOffset.y;

            p1.x *= zoom;
            p1.y *= zoom;
            p2.x *= zoom;
            p2.y *= zoom;

        }

        if (!screenSpaceThickness)
            thickness *= zoom;

        context.beginPath();
        context.lineWidth = thickness;
        context.strokeStyle = color;
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);

        context.stroke();
    }

    drawCircle(centerX, centerY, radius, thickness, color, screenSpace, screenSpaceSize) {
        if (!screenSpace) {
            centerX += canvasOffset.x;
            centerY += canvasOffset.y;

            centerX *= zoom;
            centerY *= zoom;

        }
        if (!screenSpaceSize) {
            radius *= zoom;
            thickness *= zoom;
        }

        context.beginPath();
        context.lineWidth = thickness;
        context.strokeStyle = color;
        context.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        context.stroke();
        context.fill(); // TODO do i have to fill circles?
    }

    drawRealCircle(center, radius, thickness, screenSpace, screenSpaceThickness) {
        center = center.copy();
        if (!screenSpace) {
            center.x += canvasOffset.x;
            center.y += canvasOffset.y;

            center.x *= zoom;
            center.y *= zoom;

            radius *= zoom;
        }
        if (!screenSpaceThickness) {
            thickness *= zoom;
        }

        context.beginPath();
        context.lineWidth = thickness;
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
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
            this.drawPreviewLine();
        }

        this.drawHelpers();
        // console.log("redraw.");
    }

    // DONT DELETE. USE GRADIENT!!!

    /*drawGridLine(line, endpoint) {
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
    /*
    drawGridPoint(screenpos) {
        var gridPoint = UTILITIES.getGridPos(screenpos);
        this.drawCircle(gridPoint.x * SETTINGS.gridSize + canvasOffset.x, gridPoint.y * SETTINGS.gridSize + canvasOffset.y, SETTINGS.gridPointSize);
    }//*/

    generateGradient(line) {
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
        let gradient = context.createLinearGradient(
            DRAW_MANAGER.canvasSpaceToScreenSpace(gradientStart).x,
            DRAW_MANAGER.canvasSpaceToScreenSpace(gradientStart).y,
            DRAW_MANAGER.canvasSpaceToScreenSpace(gradientEnd).x,
            DRAW_MANAGER.canvasSpaceToScreenSpace(gradientEnd).y);

        gradient.addColorStop(0, SETTINGS.selectionColorFill);
        gradient.addColorStop(1, SETTINGS.lineColorFill);

        //context.strokeStyle = gradient;
        //context.fillStyle = gradient;

        return gradient;
    }

    // TODO settings in SETTINGS und GRID verteilt...
    drawGrid() // TODO grid class?
    {
        let size = GRID.gridCellNumber * 0.5;

        let color;
        let thickness;

        for (let i = -size; i <= size; ++i) {
            if (i % SETTINGS.bigGridSize == 0) {
                thickness = 2;
                color = SETTINGS.gridBigLineColor;

            }
            else if (Math.round(i % (SETTINGS.bigGridSize * 0.5) == 0)) {
                thickness = 2;
                color = SETTINGS.gridLineColor;
            }
            else {
                thickness = 1;
                color = SETTINGS.gridLineColor;
            }

            this.drawLineFromTo(
                new Point(
                    -size * GRID.gridSize,
                    i * GRID.gridSize
                ),
                new Point(
                    size * GRID.gridSize,
                    i * GRID.gridSize
                ),
                thickness,
                color,
                false,
                true
            );
            this.drawLineFromTo(
                new Point(
                    i * GRID.gridSize,
                    -size * GRID.gridSize
                ),
                new Point(
                    i * GRID.gridSize,
                    size * GRID.gridSize
                ),
                thickness,
                color,
                false,
                true
            );
        }


        //this.drawLineFromTo(new Vector2(0, canvasOffset.y), new Vector2(canvas.width, canvasOffset.y), 11, 'darkred', false);
        //this.drawLineFromTo(new Vector2(canvasOffset.x, 0), new Vector2(canvasOffset.x, canvas.height), 11, 'darkred', false);
        let axisSize = 500;
        this.drawLineFromTo(new Vector2(-axisSize, 0), new Vector2(axisSize, 0), 2, 'darkred', false, true);
        this.drawLineFromTo(new Vector2(0, -axisSize), new Vector2(0, axisSize), 2, 'darkred', false, true);
    }

    drawObjects() {
        let objects = DATA_MANAGER.currentFile.lineObjects;

        for (var i = 0; i < objects.length; i++) {
            let color = objects[i].color.copy();
            let thickness = objects[i].thickness;

            if (objects[i] != DATA_MANAGER.currentFile.currentObject) {
                color.a = 0.3;
                thickness *= 0.5;
            }

            let unselLines = objects[i].getUnselectedLines();
            let selLines = objects[i].getSelectedLines();

            for (let line of unselLines)
                this.drawLineFromTo(line.start, line.end, thickness, color.toString(), false);
            for (let line of selLines)
            {
                let color = SETTINGS.selectionColor;
                if (line.start.selected != line.end.selected)
                    color = this.generateGradient(line);

                this.drawLineFromTo(line.start, line.end, thickness, color, false);
                
            }
        }
    }

    drawPreviewLine() {
        //DrawHelpers();

        if (LOGIC.currentState == StateEnum.DRAWING) {
            let start = MOUSE_HANDLER.downPoint;
            let end = currentPosition;
            this.drawLineFromTo(start, end, SETTINGS.lineWidth, SETTINGS.previewLineColor, false);
        }
        let p = currentPosition.copy();
        this.drawCircle(p.x, p.y, 5, 1, SETTINGS.previewLineColor, false, true); // SIFU grid stuff TODO magic number
        this.drawRealCircle(p, cursorRange, 2, false, true);
    }

    drawHelpers() {
        let screenpos = this.canvasSpaceToScreenSpace(currentPosition.copy());
        this.drawLineFromTo(new Vector2(0, screenpos.y), new Vector2(canvas.width, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
        this.drawLineFromTo(new Vector2(screenpos.x, 0), new Vector2(screenpos.x, canvas.height), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
    }

    drawHelpers2() { // for grabbing??
        return;
        context.lineWidth = SETTINGS.helperLineWidth;
        context.strokeStyle = SETTINGS.helperColor2;

        let screenpos = UTILITIES.gridpointToScreenpoint(currentPosition);

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

        let leftTop = DRAW_MANAGER.canvasSpaceToScreenSpace(UTILITIES.borderSelectionStart);
        let sizeCanvasSpace = UTILITIES.borderSelectionEnd.SubtractVector(UTILITIES.borderSelectionStart);
        let size = sizeCanvasSpace.Multiply(zoom);

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
                let color = (points[j].selected) ? SETTINGS.preciseSelectionSelectionColor : SETTINGS.preciseSelectionNoSelectionColor;
                // context.strokeStyle = (points[j].selected) ? SETTINGS.selectionColor : SETTINGS.lineColor; // TODO needed?
                context.fillStyle = 'rgba(255, 255, 255, 0.5)';

                let p = points[j].copy();
                p = DRAW_MANAGER.screenSpaceToCanvasSpace(p);
                this.drawCircle(p.x, p.y, SETTINGS.preciseSelectionHandleSize, SETTINGS.preciseSelectionLineWidth, color, false, true);
            }
        }
    }

    screenSpaceToCanvasSpace(vec2) {
        return vec2
            .Divide(zoom)
            .SubtractVector(canvasOffset);
    }
    canvasSpaceToScreenSpace(vec2) {
        return vec2
            .AddVector(canvasOffset)
            .Multiply(zoom)
        ;
    }
}