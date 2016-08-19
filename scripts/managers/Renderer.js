class Renderer {
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

        this.outlineSize = 3;
        this.handleSizeFactor = 1.5;
    }

    drawLineFromTo(p1, p2, thickness, color, screenSpace, screenSpaceThickness, ignoreCulling) {
        if (!ignoreCulling && !this.screenBounds.contains(p1) && !this.screenBounds.contains(p2))
        {
            ++this.culledLinesCounter;
            return;
        }

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

    //drawCircle(centerX, centerY, radius, thickness, color, screenSpace, screenSpaceSize, filled) {
    //    if (!screenSpace) {
    //        centerX += CAMERA.canvasOffset.x;
    //        centerY += CAMERA.canvasOffset.y;

    //        centerX *= CAMERA.zoom;
    //        centerY *= CAMERA.zoom;

    //    }
    //    if (!screenSpaceSize) {
    //        radius *= CAMERA.zoom;
    //        thickness *= CAMERA.zoom;
    //    }

    //    context.beginPath();
    //    context.lineWidth = thickness;
    //    context.strokeStyle = color;
    //    // performance "circles"
    //    /*
    //    context.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    //    /*/
    //    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    //    //*/
    //    if (filled) {
    //        context.fillStyle = color;
    //        context.fill();
    //    }
    //    else
    //        context.stroke();

    //    ++this.drawnCirclesCounter;
    //}

    drawRealCircle(center, radius, thickness, color, screenSpace, screenSpaceThickness, filled) {

        if (!this.screenBounds.shrink(radius + thickness*0.5).contains(center)) {
            ++this.culledCirclesCounter;
            return;
        }

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

        if (filled) {
            context.fillStyle = color;
            context.fill();
        } else {
            context.strokeStyle = color;
            context.stroke();
        }

        ++this.drawnCirclesCounter;
    }

    redraw(step) {
        if (arguments.length == 0) {
            if (!this.requestRedraw) {
                this.requestRedraw = true;
                window.requestAnimationFrame(step => RENDERER.redraw(step));
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
            if (LOGIC.currentState == StateEnum.BORDERSELECTION || spaceDown)
                this.drawCrosshair();
            this.drawBorderSelection();
        }

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

    generateGradient(start, end, toColor) {
        start = CAMERA.canvasSpaceToScreenSpace(start);
        end = CAMERA.canvasSpaceToScreenSpace(end);

        let gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, SETTINGS.selectionColorFill);
        gradient.addColorStop(1, toColor.toString());
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

    drawSelectionOutline(delta) {
        if (LOGIC.currentState == StateEnum.RENDERPREVIEW)
            return;

        for (let line of SELECTION.lines)
            this.drawLineFromTo(line.start.position.addVector(delta), line.end.position.addVector(delta), line.thickness + this.outlineSize / CAMERA.zoom, SETTINGS.selectionColor);

        for (let p of SELECTION.points) {
            let color = this.generateGradient(p.position.addVector(delta), p.opposite.position, Color.transparent());
            this.drawLineFromTo(p.position.addVector(delta), p.opposite.position, p.line.thickness + this.outlineSize / CAMERA.zoom, color, false, false);
        }

        // selected points
        for (let p of UTILITIES.linesToLineEndings(SELECTION.lines).concat(SELECTION.points))
        {
            let radius = (LINE_MANIPULATOR.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position.addVector(delta), radius + this.outlineSize * 0.5 / CAMERA.zoom, this.outlineSize / CAMERA.zoom, SETTINGS.selectionColor, false, false, true)
        }
    }

    drawObjects() {
        if (LOGIC.currentState != StateEnum.GRABBING) 
            this.drawSelectionOutline(new Vector2(0, 0));

        for (let layer of FILE.layers)
            this.drawLayer(layer);


        // selected points
        if (LOGIC.currentState != StateEnum.GRABBING) {
            for (let p of SELECTION.points.concat(SELECTION.getUnselectedPointsOfPartialLines()).concat(UTILITIES.linesToLineEndings(SELECTION.lines))) {
                let radius = (!LOGIC.isPreviewing() && LINE_MANIPULATOR.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
                this.drawRealCircle(p.position, radius, 0, p.line.color, false, false, true);
            }
        }

        // selected lines. dotted if origin while moving lines
        let movingLines = LOGIC.currentState == StateEnum.GRABBING;
        for (let line of SELECTION.lines.concat(SELECTION.partialLines))
        {
            if (movingLines)
                context.setLineDash([line.thickness * 6 * CAMERA.zoom, line.thickness * 4 * CAMERA.zoom]);


            let thickness = movingLines ? line.thickness * 0.5 : line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position, line.end.position, thickness, line.color);

            if (!LOGIC.isPreviewing())
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(line.start.position.mirrorX(), line.end.position.mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(line.start.position.mirrorY(), line.end.position.mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(line.start.position.flipped(), line.end.position.flipped(), thickness, color);

            if (movingLines)
                context.setLineDash([]);
        }


    }

    drawLayer(layer) {
        if (!layer.visible)
            return;
        let thickness;

        if (!LOGIC.isPreviewing() && layer != FILE.currentLayer) {
            thickness *= 0.5;
        }

        
        for (let line of layer.lines)
        {

            let thickness = line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position, line.end.position, thickness, color);

            if (!LOGIC.isPreviewing())
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(line.start.position.mirrorX(), line.end.position.mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(line.start.position.mirrorY(), line.end.position.mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(line.start.position.flipped(), line.end.position.flipped(), thickness, color);
        }

        for (let p of UTILITIES.linesToLineEndings(layer.lines))
        {
            let radius = (layer == FILE.currentLayer && !LOGIC.isPreviewing() && LINE_MANIPULATOR.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position, radius, 0, p.line.color, false, false, true)
        }
    }

    drawPreviewLine() {
        if (LOGIC.currentState == StateEnum.DRAWING) {
            let start = MOUSE_HANDLER.downPoint;
            let end = currentPosition;
            this.drawLineFromTo(start, end, currentLineThickness, SETTINGS.previewLineColor, false);
        }

        this.drawRealCircle(currentPosition, currentLineThickness * 0.5, 1, currentLineColor.toString(), false, true, true);
        this.drawRealCircle(selectionCursor, cursorRange, 2, SETTINGS.selectionColor, false, true);
    }

    drawMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MOUSE_HANDLER.grabStartPosition);
        this.drawSelectionOutline(delta);

        let other;

        // selected lines
        for (let line of SELECTION.lines)
        {
            let thickness = line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position.addVector(delta), line.end.position.addVector(delta), thickness, color);

            if (!LOGIC.isPreviewing()) 
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(line.start.position.addVector(delta).mirrorX(), line.end.position.addVector(delta).mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(line.start.position.addVector(delta).mirrorY(), line.end.position.addVector(delta).mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(line.start.position.addVector(delta).flipped(), line.end.position.addVector(delta).flipped(), thickness, color);
        }

        // partially selected lines
        for (let point of SELECTION.points) {
            let p = point.position.addVector(delta);

            let thickness = point.line.thickness;
            let color = point.line.color.copy();

            this.drawLineFromTo(p, point.opposite.position, thickness, color, false);

            if (!LOGIC.isPreviewing())
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(p.mirrorX(), point.opposite.position.mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(p.mirrorY(), point.opposite.position.mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(p.flipped(), point.opposite.position.flipped(), thickness, color);
        }

        // selected points
        for (let p of UTILITIES.linesToLineEndings(SELECTION.lines).concat(SELECTION.points)) {
            let radius = (!LOGIC.isPreviewing() && LINE_MANIPULATOR.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position.addVector(delta), radius, 0, p.line.color, false, false, true);
        }
    }

    drawCrosshair() {
        let screenpos = CAMERA.canvasSpaceToScreenSpace(selectionCursor.copy());
        this.drawLineFromTo(new Vector2(0, screenpos.y), new Vector2(canvas.width, screenpos.y), SETTINGS.helperLineWidth, SETTINGS.selectionColor, true, true, true);
        this.drawLineFromTo(new Vector2(screenpos.x, 0), new Vector2(screenpos.x, canvas.height), SETTINGS.helperLineWidth, SETTINGS.selectionColor, true, true, true);
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