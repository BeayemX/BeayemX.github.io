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

    drawCircle(centerX, centerY, radius, thickness, color, screenSpace, screenSpaceSize, filled) {
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
        // performance "circles"
        //context.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        if (filled) {
            context.fillStyle = color;
            context.fill();
        }
        else
            context.stroke();

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
            this.drawAxis();
            if (LOGIC.currentState == StateEnum.BORDERSELECTION)
                this.drawHelpers();
            else if (grabInitializedWithKeyboard)
                this.drawHelpers2();
            this.drawBorderSelection();
        }

        if (!LOGIC.isPreviewing())
            this.drawHelpers();

        this.drawObjects();

        if (!LOGIC.isPreviewing())
            this.drawPreciseSelection();


        if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.DRAWING)
            this.drawPreviewLine();

        // console.log("redraw.");
    }

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
    drawGrid()
    {
        if (!showGrid)
            return;

        GRID.drawGrid();
        return;
    }

    drawAxis() {
        let axisSize = 500;
        this.drawLineFromTo(new Vector2(-axisSize, 0), new Vector2(axisSize, 0), 1, 'darkred', false, true);
        this.drawLineFromTo(new Vector2(0, -axisSize), new Vector2(0, axisSize), 1, 'darkred', false, true);
    }

    drawObjects() {
        let objects = DATA_MANAGER.currentFile.lineObjects;

        for (let i = 0; i < objects.length; i++) {
            let color = objects[i].color.copy();
            let thickness = objects[i].thickness;

            if (objects[i] != DATA_MANAGER.currentFile.currentObject) {
                color.a = 0.3;
                //thickness *= 0.5;
            }

            let unselLines = objects[i].getUnselectedLines();
            let selLines = objects[i].getSelectedLines();

            let selPoints = objects[i].getAllPointsWithSelection(true);
            let unselPoints = objects[i].getAllPointsWithSelection(false);

            let radius = objects[i] == DATA_MANAGER.currentFile.currentObject ? thickness * 2 : thickness * 0.5;
            if (LOGIC.isPreviewing() || !LINE_MANIPULATOR.showHandles)
                radius = thickness * 0.5;

            let bgColor = color.copy();

            for (let line of unselLines)
                this.drawLineFromTo(line.start, line.end, thickness, bgColor.toString(), false);

            color = LOGIC.isPreviewing() ? color : SETTINGS.selectionColor;

            for (let line of selLines)
            {
                if (!LOGIC.isPreviewing()) {
                    color = SETTINGS.selectionColor;
                    if (line.start.selected != line.end.selected)
                        color = this.generateGradient(line);
                }

                this.drawLineFromTo(line.start, line.end, thickness, color, false);
            }

            for (let p of unselPoints) // TODO PERFORMANCE if multiple lines share point, point gets drawn multiple times...
                this.drawCircle(p.x, p.y, radius, 0, bgColor.toString(), false, false, true);

            for (let p of selPoints)
                this.drawCircle(p.x, p.y, radius, 0, color, false, false, true);
        }
    }

    drawPreviewLine() {
        //DrawHelpers();

        if (LOGIC.currentState == StateEnum.DRAWING) {
            let start = MOUSE_HANDLER.downPoint;
            let end = currentPosition;
            this.drawLineFromTo(start, end, SETTINGS.previewLineWidth, SETTINGS.previewLineColor, false);
        }
        let p = currentPosition.copy();
        this.drawCircle(p.x, p.y, 5, 1, SETTINGS.previewLineColor, false, true); // SIFU grid stuff TODO magic number
        this.drawRealCircle(selectionCursor, cursorRange, 2, false, true);
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
        let sizeCanvasSpace = UTILITIES.borderSelectionEnd.subtractVector(UTILITIES.borderSelectionStart);
        let size = sizeCanvasSpace.multiply(zoom);

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
            .divide(zoom)
            .subtractVector(canvasOffset);
    }
    canvasSpaceToScreenSpace(vec2) {
        return vec2
            .addVector(canvasOffset)
            .multiply(zoom)
        ;
    }
}