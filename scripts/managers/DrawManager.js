class DrawManager {
    constructor() {
        console.log("DrawManager created.");
        this.batchedLines = [];
        this.batchedCircles = [];
        this.screenBounds = null;

        this.drawnLinesCounter = 0;
        this.culledLinesCounter = 0;
        this.culledCirclesCounter = 0;
        this.batchedCirclesCounter = 0;
        this.copiedCirclesCounter = 0;
        this.drawnCirclesCounter = 0;

        this.oldStep = 0;
        this.requestRedraw = false;
        this.fps = 0;

        this.outlineFactor = 2;
    }

    drawLineFromTo(p1, p2, thickness, color, screenSpace, screenSpaceThickness) {
        p1 = p1.copy();
        p2 = p2.copy();

        if (!screenSpace) {
            p1.x += CAMERA.canvasOffset.x;
            p1.y += CAMERA.canvasOffset.y;
            p2.x += CAMERA.canvasOffset.x;
            p2.y += CAMERA.canvasOffset.y;

            p1.x *= CAMERA.zoom;
            p1.y *= CAMERA.zoom;
            p2.x *= CAMERA.zoom;
            p2.y *= CAMERA.zoom;

        }

        if (!screenSpaceThickness)
            thickness *= CAMERA.zoom;

        context.beginPath();
        context.lineWidth = thickness;
        context.strokeStyle = color;
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);

        context.stroke();

        ++this.drawnLinesCounter;
    }

    batchLine(line, ignoreCulling) { // TODO remove me if lines outside of screen rect get drawn
        if (ignoreCulling || this.screenBounds.contains(line))
            this.batchedLines.push(line);
        else
            ++this.culledLinesCounter;

    }

    batchCircle(circle) {
        if (this.screenBounds.contains(circle)) {
            if (this.batchedCircles[circle.toString()] == undefined)
                this.batchedCircles[circle.toString()] = circle;
            else
                ++this.batchedCirclesCounter;
        }
        else
            ++this.culledCirclesCounter;
    }

    renderBatchedLines(thickness, color, screenSpace, screenSpaceThickness) {
        if (this.batchedLines.length == 0)
            return;

        context.beginPath();

        if (!screenSpaceThickness)
            thickness *= CAMERA.zoom;


        context.lineWidth = thickness;
        context.strokeStyle = color;

        let p1;
        let p2;

        for (let line of this.batchedLines) {
            p1 = line.start.position.copy();
            p2 = line.end.position.copy();

            if (!screenSpace) {
                p1.x += CAMERA.canvasOffset.x;
                p1.y += CAMERA.canvasOffset.y;
                p2.x += CAMERA.canvasOffset.x;
                p2.y += CAMERA.canvasOffset.y;

                p1.x *= CAMERA.zoom;
                p1.y *= CAMERA.zoom;
                p2.x *= CAMERA.zoom;
                p2.y *= CAMERA.zoom;
            }

            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
        }

        this.drawnLinesCounter += Object.keys(this.batchedLines).length;

        context.stroke();
        this.batchedLines = [];
    }

    renderBatchedCircles(radius, thickness, color, screenSpace, screenSpaceSize, filled) {

        if (Object.keys(this.batchedCircles).length == 0)
            return;

        if (!screenSpaceSize) {
            radius *= CAMERA.zoom;
            thickness *= CAMERA.zoom;
        }

        // TODO margin doesnt help much. circles sometimes still seem chopped off
        let margin = 10;
        let doubleRadius = radius * 2 + thickness * 2 + margin;
        offscreenCanvas.width = doubleRadius;
        offscreenCanvas.height = doubleRadius;
        offscreenCanvas.style.left = -doubleRadius;
        offscreenCanvas.style.top = -doubleRadius;

        offscreenContext.beginPath();
        offscreenContext.strokeStyle = color;
        offscreenContext.fillStyle = color;
        offscreenContext.lineWidth = thickness;
        offscreenContext.arc(radius + thickness + margin, radius + thickness + margin, radius, 0, 2 * Math.PI);

        ++this.drawnCirclesCounter;

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
                    center.x += CAMERA.canvasOffset.x;
                    center.y += CAMERA.canvasOffset.y;

                    center.x *= CAMERA.zoom;
                    center.y *= CAMERA.zoom;
                }
                context.drawImage(offscreenCanvas, center.x - (radius + thickness + margin), center.y - (radius + thickness + margin));
                ++this.copiedCirclesCounter;
            }
        }

        this.batchedCircles = [];
    }

    drawCircle(centerX, centerY, radius, thickness, color, screenSpace, screenSpaceSize, filled) {
        if (!screenSpace) {
            centerX += CAMERA.canvasOffset.x;
            centerY += CAMERA.canvasOffset.y;

            centerX *= CAMERA.zoom;
            centerY *= CAMERA.zoom;

        }
        if (!screenSpaceSize) {
            radius *= CAMERA.zoom;
            thickness *= CAMERA.zoom;
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

        ++this.drawnCirclesCounter;
    }

    drawRealCircle(center, radius, thickness, screenSpace, screenSpaceThickness) {
        center = center.copy();
        if (!screenSpace) {
            center.x += CAMERA.canvasOffset.x;
            center.y += CAMERA.canvasOffset.y;

            center.x *= CAMERA.zoom;
            center.y *= CAMERA.zoom;

            radius *= CAMERA.zoom;
        }
        if (!screenSpaceThickness) {
            thickness *= CAMERA.zoom;
        }

        context.beginPath();
        context.lineWidth = thickness;
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
        ++this.drawnCirclesCounter;
    }

    redraw(step) {
        if (arguments.length == 0) {
            if (!this.requestRedraw) {
                this.requestRedraw = true;
                window.requestAnimationFrame(step => DRAW_MANAGER.redraw(step));
            }
            return;
        }
        else {
            this.requestRedraw = false;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        this.screenBounds = CAMERA.getVisibleBounds();

        this.drawnLinesCounter = 0;
        this.culledLinesCounter = 0;
        this.culledCirclesCounter = 0;
        this.batchedCirclesCounter = 0;
        this.copiedCirclesCounter = 0;
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

        this.drawSelection();
        this.drawObjects();

        if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.DRAWING)
            this.drawPreviewLine();

        if (LOGIC.currentState == StateEnum.GRABBING)
            this.drawMoveLinesPreview();

        this.fps = 1000 / (step - this.oldStep);
        this.oldStep = step;
        GUI.writeToStats("FPS", this.fps.toFixed(2));
        GUI.writeToStats("Lines drawn", this.drawnLinesCounter);
        GUI.writeToStats("Culled lines", this.culledLinesCounter);
        GUI.writeToStats("Culled circles", this.culledCirclesCounter);
        GUI.writeToStats("Circles batched", this.batchedCirclesCounter);
        GUI.writeToStats("Circles copied", this.copiedCirclesCounter);
        GUI.writeToStats("Circles drawn", this.drawnCirclesCounter);
    }

    generateGradient(start, end, intoTransparency) {
        start = CAMERA.canvasSpaceToScreenSpace(start);
        end = CAMERA.canvasSpaceToScreenSpace(end);

        let gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, SETTINGS.selectionColorFill);
        if (intoTransparency)
            gradient.addColorStop(1, 'transparent');
        else
            gradient.addColorStop(1, SETTINGS.lineColorFill);
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
        this.batchLine(new Line(new Vector2(-axisSize, 0), new Vector2(axisSize, 0)), true);
        this.batchLine(new Line(new Vector2(0, -axisSize), new Vector2(0, axisSize)), true);
        this.renderBatchedLines(1, 'darkred', false, true);
    }

    drawSelection() {
        if (LOGIC.currentState == StateEnum.RENDERPREVIEW || LOGIC.currentState == StateEnum.GRABBING)
            return;

        // SIFU TODO use line thickness
        let thickness = 1;

        // selected lines outline
        //context.setLineDash([15, 3]);
        for (let line of SELECTION.lines)
            this.batchLine(line);
        this.renderBatchedLines(thickness * this.outlineFactor, SETTINGS.selectionColor, false);
        //context.setLineDash([]);


        // TODO no batching, stats correct?
        // partially selected lines
        for (let p of SELECTION.points) {
            let color = this.generateGradient(p.position, p.opposite.position, true);
            this.drawLineFromTo(p.position, p.opposite.position, p.line.thickness * this.outlineFactor, color, false, false);
        }

        // selected points
        for (let p of UTILITIES.linesToLineEndings(SELECTION.lines).concat(SELECTION.points))
            this.batchCircle(p.position);
        this.renderBatchedCircles(thickness * this.outlineFactor, 1, SETTINGS.selectionColor, false, false, false);
    }

    drawObjects() {
        // caching
        let thickness;
        let bgColor = new Color(0, 0, 0, 0);

        for (let layer of FILE.layers)
        {
        // create variables inside loop because gradient doesnt have copyValues();
            let color = new Color(0, 0, 0, 0);
            color.copyValues(layer.color);
            bgColor.copyValues(color);
            thickness = layer.thickness;

            if (!LOGIC.isPreviewing() && layer != FILE.currentLayer) {
                thickness *= 0.5;
            }

            let radius = layer == FILE.currentLayer ? thickness * 2 : thickness * 0.5;
            if (LOGIC.isPreviewing() || !LINE_MANIPULATOR.showHandles)
                radius = thickness * 0.5;

        // all lines
            for (let line of layer.lines)
                this.batchLine(line);
            this.renderBatchedLines(thickness, bgColor.toString(), false);

        // line endings
            for (let p of UTILITIES.linesToLineEndings(layer.lines))
                this.batchCircle(p.position);
            this.renderBatchedCircles(radius, 0, layer.color.toString(), false, false, true);
        }

        // selected points
        if (LOGIC.currentState != StateEnum.GRABBING) {
            for (let p of SELECTION.points.concat(SELECTION.getUnselectedPointsOfPartialLines()).concat(UTILITIES.linesToLineEndings(SELECTION.lines)))
               this.batchCircle(p.position);
            this.renderBatchedCircles(thickness * 2, 0, 'black', false, false, true);
        }

        // selected lines. dotted if origin while moving lines
        if (LOGIC.currentState == StateEnum.GRABBING) {
            context.setLineDash([6 * CAMERA.zoom, 4 * CAMERA.zoom]);
            thickness *= 0.5;
        }

        for (let line of SELECTION.lines.concat(SELECTION.partialLines))
            this.batchLine(line);
        this.renderBatchedLines(thickness, bgColor.toString(), false);

        if (LOGIC.currentState == StateEnum.GRABBING)
            context.setLineDash([]);
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

        // selected lines
        for (let line of SELECTION.lines)
            this.batchLine(new Line(line.start.position.addVector(delta), line.end.position.addVector(delta)));
        this.renderBatchedLines(FILE.currentLayer.thickness, SETTINGS.selectionColor, false);

        // partially selected lines
        for (let point of SELECTION.points) {
            let p = point.position.addVector(delta);
            let color = this.generateGradient(p, point.opposite.position);
            this.drawLineFromTo(p, point.opposite.position, FILE.currentLayer.thickness, color, false);
        }

        // selected points
        for (let p of UTILITIES.linesToLineEndings(SELECTION.lines).concat(SELECTION.points))
            this.batchCircle(p.position.addVector(delta));
        this.renderBatchedCircles(FILE.currentLayer.thickness * 2, 0, SETTINGS.selectionColor, false, false, true);
    }

    drawHelpers() {
        let screenpos = CAMERA.canvasSpaceToScreenSpace(currentPosition.copy());
        this.drawLineFromTo(new Vector2(0, screenpos.y), new Vector2(canvas.width, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
        this.drawLineFromTo(new Vector2(screenpos.x, 0), new Vector2(screenpos.x, canvas.height), SETTINGS.helperLineWidth, SETTINGS.helperColor, true, true);
    }

    drawHelpers2() { // for grabbing
        context.lineWidth = SETTINGS.helperLineWidth;
        context.strokeStyle = SETTINGS.helperColor2;

        let screenpos = CAMERA.canvasSpaceToScreenSpace(currentPosition);
        let start = CAMERA.canvasSpaceToScreenSpace(MOUSE_HANDLER.grabStartPosition);

        this.drawLineFromTo(new Vector2(start.x, start.y), new Vector2(screenpos.x, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.helperColor2, true, true);
    }

    drawBorderSelection() {
        if (LOGIC.currentState != StateEnum.BORDERSELECTION || !UTILITIES.borderSelectionStart || !UTILITIES.borderSelectionEnd)
            return;

        context.strokeStyle = SETTINGS.selectionColor;
        context.fillStyle = SETTINGS.borderSelectionColor;

        let leftTop = CAMERA.canvasSpaceToScreenSpace(UTILITIES.borderSelectionStart);
        let sizeCanvasSpace = UTILITIES.borderSelectionEnd.subtractVector(UTILITIES.borderSelectionStart);
        let size = sizeCanvasSpace.multiply(CAMERA.zoom);

        context.rect(leftTop.x, leftTop.y, size.x, size.y);
        context.fillRect(leftTop.x, leftTop.y, size.x, size.y);
        context.stroke();
    }
}