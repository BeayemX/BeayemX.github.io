class DrawManager {
    constructor() {
        console.log("DrawManager created.");
        this.batchedLines = [];
        this.batchedCircles = [];
        this.screenBounds = null;

        this.culledLinesCounter = 0;
        this.culledCirclesCounter = 0;
        this.batchedCirclesCounter = 0; // TODO could use lines.length * 2?
        this.drawnCirclesCounter = 0;
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

    batchLine(line, ignoreCulling) { // TODO remove me if lines outside of screen rect get drawn
        if (ignoreCulling || this.screenBounds.contains(line))
            this.batchedLines.push(line);
        else
            ++this.culledLinesCounter;

    }

    batchCircle(circle) {
        if (this.screenBounds.contains(circle)) {
            ++this.batchedCirclesCounter;
            this.batchedCircles[circle.toString()] = circle;
        }
        else
            ++this.culledCirclesCounter;
    }

    renderBatchedLines(thickness, color, screenSpace, screenSpaceThickness) {
        context.beginPath();

        if (!screenSpaceThickness)
            thickness *= zoom;


        context.lineWidth = thickness;
        context.strokeStyle = color;

        let p1;
        let p2;

        for (let line of this.batchedLines) {
            p1 = line.start.copy();
            p2 = line.end.copy();

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

            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
        }

        context.stroke();
        this.batchedLines = [];
    }

    renderBatchedCircles(radius, thickness, color, screenSpace, screenSpaceSize, filled) {
        if (!screenSpaceSize) {
            radius *= zoom;
            thickness *= zoom;
        }

        let doubleRadius = radius * 2;
        offscreenCanvas.width = doubleRadius;
        offscreenCanvas.height = doubleRadius;
        offscreenCanvas.style.left = -doubleRadius;
        offscreenCanvas.style.top = -doubleRadius;

        offscreenContext.beginPath();
        offscreenContext.strokeStyle = color;
        offscreenContext.fillStyle = color;
        offscreenContext.lineWidth = thickness;
        offscreenContext.arc(radius, radius, radius, 0, 2 * Math.PI);

        if (filled)
            offscreenContext.fill();
        else
            offscreenContext.stroke();

        let center = new Vector2(0, 0);
        let circle = null;
        for (let key in this.batchedCircles) {
            if (this.batchedCircles.hasOwnProperty(key)) {
                circle = this.batchedCircles[key];
                center.setValues(circle.x, circle.y);
                if (!screenSpace) {
                    center.x += canvasOffset.x;
                    center.y += canvasOffset.y;

                    center.x *= zoom;
                    center.y *= zoom;
                }
                context.drawImage(offscreenCanvas, center.x - radius, center.y - radius);
            }
        }

        this.drawnCirclesCounter += Object.keys(this.batchedCircles).length;
        this.batchedCircles = [];
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
        /*
        context.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        /*/
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        //*/
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
        this.screenBounds = this.getVisibleBounds();
        this.culledLinesCounter = 0;
        this.culledCirclesCounter = 0;
        this.batchedCirclesCounter = 0;
        this.drawnCirclesCounter = 0;

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

        if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.DRAWING)
            this.drawPreviewLine();

        if (LOGIC.currentState == StateEnum.GRABBING)
            this.drawMoveLinesPreview();

        // console.log("redraw.");
        GUI.writeToStats("Culled lines", this.culledLinesCounter);
        GUI.writeToStats("Culled circles", this.culledCirclesCounter);
        GUI.writeToStats("Circles batched", (this.batchedCirclesCounter - this.drawnCirclesCounter));
        GUI.writeToStats("Circles drawn", this.drawnCirclesCounter);
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
    drawGrid() {
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
        let layers = FILE.layers;

        // caching
        let thickness;
        let bgColor = new Color(0, 0, 0, 0);

        for (let i = 0; i < layers.length; i++) {
            // create variables inside loop because gradient doesnt have copyValues();
            let color = new Color(0, 0, 0, 0);
            color.copyValues(layers[i].color);
            thickness = layers[i].thickness;

            if (layers[i] != FILE.currentLayer && LOGIC.currentState != StateEnum.RENDERPREVIEW) {
                color.a = 0.3;
                //thickness *= 0.5;
            }

            let unselLines = layers[i].getUnselectedLines();
            let selLines = layers[i].getSelectedLines();

            let selPoints = layers[i].getAllPointsWithSelection(true);
            let unselPoints = layers[i].getAllPointsWithSelection(false);

            let radius = layers[i] == FILE.currentLayer ? thickness * 2 : thickness * 0.5;
            if (LOGIC.isPreviewing() || !LINE_MANIPULATOR.showHandles)
                radius = thickness * 0.5;

            bgColor.copyValues(color);

            for (let line of unselLines)
                    this.batchLine(line);

            this.renderBatchedLines(thickness, bgColor.toString(), false);

            for (let line of selLines)
            {
                if (LOGIC.isPreviewing() || (line.start.selected == line.end.selected)) {
                    this.batchLine(line);
                }
                else {
                    if (this.screenBounds.contains(line)) {

                        color = this.generateGradient(line);
                        this.drawLineFromTo(line.start, line.end, thickness, color, false);
                    }
                    else
                        ++this.culledLinesCounter;
                }
            }

            color = LOGIC.isPreviewing() ? color : SETTINGS.selectionColor; // FIXME why dont i use hexToColor???

            if (this.batchedLines.length > 0)
                this.renderBatchedLines(thickness, color, false);

            for (let p of unselPoints) // TODO PERFORMANCE if multiple lines share point, point gets drawn multiple times...
            //this.drawCircle(p.x, p.y, radius, 0, bgColor.toString(), false, false, true);
                this.batchCircle(p);
            this.renderBatchedCircles(radius, 0, bgColor.toString(), false, false, true);

            for (let p of selPoints)
                this.batchCircle(p);
            this.renderBatchedCircles(radius, 0, color, false, false, true);
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

    // SIFU FIXME XXX TODO performance killer. for each selected point iterating over all other points + all other selected points...
    drawMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MOUSE_HANDLER.grabStartPosition);
        let other;
        let a;
        let b;

        for (let point of MOUSE_HANDLER.previewLines)
        {
            other = FILE.currentLayer.getOtherPointBelongingToLine(point);
            a = point.addVector(delta);
            b = other;

            for (var i = MOUSE_HANDLER.previewLines.length-1; i >= 0; --i) {
                if (MOUSE_HANDLER.previewLines[i] === other) {

                    break;
                }
                    
            }
            if (i != -1)
                b = other.addVector(delta);

            this.batchLine(new Line(a.x, a.y, b.x, b.y));
        }

        this.renderBatchedLines(1, 'yellow', false);
    }

    drawHelpers() {
        let screenpos = this.canvasSpaceToScreenSpace(currentPosition.copy());
        this.drawLineFromTo(new Vector2(0, screenpos.y), new Vector2(canvas.width, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
        this.drawLineFromTo(new Vector2(screenpos.x, 0), new Vector2(screenpos.x, canvas.height), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
    }

    drawHelpers2() { // for grabbing
        context.lineWidth = SETTINGS.helperLineWidth;
        context.strokeStyle = SETTINGS.helperColor2;

        let screenpos = this.canvasSpaceToScreenSpace(currentPosition);
        let start = this.canvasSpaceToScreenSpace(MOUSE_HANDLER.grabStartPosition);

        this.drawLineFromTo(new Vector2(start.x, start.y), new Vector2(screenpos.x, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.helperColor2, true, true);
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

    getVisibleBounds() {
        return new Bounds(
            this.screenSpaceToCanvasSpace(new Vector2(0, 0)),
            this.screenSpaceToCanvasSpace(new Vector2(canvas.width, canvas.height))
            );
    }
}