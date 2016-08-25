class Renderer {
    static init() {
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

    static drawLineFromTo(p1, p2, thickness, color, screenSpace, screenSpaceThickness, ignoreCulling) {
        if (!ignoreCulling && !this.screenBounds.contains(p1) && !this.screenBounds.contains(p2))
        {
            ++this.culledLinesCounter;
            return;
        }

        p1 = p1.copy();
        p2 = p2.copy();

        if (!screenSpace) {
            p1.x += Camera.canvasOffset.x;
            p1.y += Camera.canvasOffset.y;
            p2.x += Camera.canvasOffset.x;
            p2.y += Camera.canvasOffset.y;

            p1.x *= Camera.zoom;
            p1.y *= Camera.zoom;
            p2.x *= Camera.zoom;
            p2.y *= Camera.zoom;

        }

        if (!screenSpaceThickness)
            thickness *= Camera.zoom;

        context.beginPath();
        context.lineWidth = thickness;
        context.strokeStyle = color;
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);

        context.stroke();

        ++this.drawnLinesCounter;
    }

    static batchLine(line, ignoreCulling) { // TODO remove me if lines outside of screen rect get drawn
        if (ignoreCulling || this.screenBounds.contains(line))
            this.batchedLines.push(line);
        else
            ++this.culledLinesCounter;

    }

    static batchCircle(circle) {
        if (this.screenBounds.contains(circle)) {
            if (this.batchedCircles[circle.toString()] == undefined)
                this.batchedCircles[circle.toString()] = circle;
            else
                ++this.batchedCirclesCounter;
        }
        else
            ++this.culledCirclesCounter;
    }

    static renderBatchedLines(thickness, color, screenSpace, screenSpaceThickness) {
        if (this.batchedLines.length == 0)
            return;

        context.beginPath();

        if (!screenSpaceThickness)
            thickness *= Camera.zoom;


        context.lineWidth = thickness;
        context.strokeStyle = color;

        let p1;
        let p2;

        for (let line of this.batchedLines) {
            p1 = line.start.position.copy();
            p2 = line.end.position.copy();

            if (!screenSpace) {
                p1.x += Camera.canvasOffset.x;
                p1.y += Camera.canvasOffset.y;
                p2.x += Camera.canvasOffset.x;
                p2.y += Camera.canvasOffset.y;

                p1.x *= Camera.zoom;
                p1.y *= Camera.zoom;
                p2.x *= Camera.zoom;
                p2.y *= Camera.zoom;
            }

            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
        }

        this.drawnLinesCounter += Object.keys(this.batchedLines).length;

        context.stroke();
        this.batchedLines = [];
    }

    static renderBatchedCircles(radius, thickness, color, screenSpace, screenSpaceSize, filled) {

        if (Object.keys(this.batchedCircles).length == 0)
            return;

        if (!screenSpaceSize) {
            radius *= Camera.zoom;
            thickness *= Camera.zoom;
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
                    center.x += Camera.canvasOffset.x;
                    center.y += Camera.canvasOffset.y;

                    center.x *= Camera.zoom;
                    center.y *= Camera.zoom;
                }
                context.drawImage(offscreenCanvas, center.x - (radius + thickness + margin), center.y - (radius + thickness + margin));
                ++this.copiedCirclesCounter;
            }
        }

        this.batchedCircles = [];
    }

    //drawCircle(centerX, centerY, radius, thickness, color, screenSpace, screenSpaceSize, filled) {
    //    if (!screenSpace) {
    //        centerX += Camera.canvasOffset.x;
    //        centerY += Camera.canvasOffset.y;

    //        centerX *= Camera.zoom;
    //        centerY *= Camera.zoom;

    //    }
    //    if (!screenSpaceSize) {
    //        radius *= Camera.zoom;
    //        thickness *= Camera.zoom;
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

    static drawRealCircle(center, radius, thickness, color, screenSpace, screenSpaceThickness, filled) {

        if (!this.screenBounds.shrink(radius + thickness*0.5).contains(center)) {
            ++this.culledCirclesCounter;
            return;
        }

        center = center.copy();
        if (!screenSpace) {
            center.x += Camera.canvasOffset.x;
            center.y += Camera.canvasOffset.y;

            center.x *= Camera.zoom;
            center.y *= Camera.zoom;

            radius *= Camera.zoom;
        }
        if (!screenSpaceThickness) {
            thickness *= Camera.zoom;
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

    static redraw(step) {
        if (arguments.length == 0) {
            if (!this.requestRedraw) {
                this.requestRedraw = true;
                window.requestAnimationFrame(step => Renderer.redraw(step));
            }
            return;
        }
        else {
            this.requestRedraw = false;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        this.screenBounds = Camera.getVisibleBounds();

        this.drawnLinesCounter = 0;
        this.culledLinesCounter = 0;
        this.culledCirclesCounter = 0;
        this.batchedCirclesCounter = 0;
        this.copiedCirclesCounter = 0;
        this.drawnCirclesCounter = 0;

        if (!Logic.isPreviewing()) {
            this.drawGrid();
            this.drawAxis();
            if (Logic.currentState == StateEnum.BORDERSelection || spaceDown)
                this.drawCrosshair();
            this.drawBorderSelection();
        }

        this.drawObjects();

        if (Logic.currentState == StateEnum.IDLE || Logic.currentState == StateEnum.DRAWING)
            this.drawPreviewLine();

        if (Logic.currentState == StateEnum.GRABBING)
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

    static generateGradient(start, end, toColor) {
        start = Camera.canvasSpaceToScreenSpace(start);
        end = Camera.canvasSpaceToScreenSpace(end);

        let gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, Settings.selectionColorFill);
        gradient.addColorStop(1, toColor.toString());
        return gradient;
    }

    // TODO settings in Settings und GridManager verteilt...
    static drawGrid() {
        if (!showGrid)
            return;

        GridManager.grid.drawGrid();
        return;
    }

    static drawAxis() {
        let axisSize = 500;
        this.batchLine(new Line(new Vector2(-axisSize, 0), new Vector2(axisSize, 0)), true);
        this.batchLine(new Line(new Vector2(0, -axisSize), new Vector2(0, axisSize)), true);
        this.renderBatchedLines(1, 'darkred', false, true);
    }

    static drawSelectionOutline(delta) {
        if (Logic.isPreviewing())
            return;

        for (let line of Selection.lines)
            this.drawLineFromTo(line.start.position.addVector(delta), line.end.position.addVector(delta), line.thickness + this.outlineSize / Camera.zoom, Settings.selectionColor);

        for (let p of Selection.points) {
            let color = this.generateGradient(p.position.addVector(delta), p.opposite.position, Color.transparent());
            this.drawLineFromTo(p.position.addVector(delta), p.opposite.position, p.line.thickness + this.outlineSize / Camera.zoom, color, false, false);
        }

        // selected points
        for (let p of Utilities.linesToLineEndings(Selection.lines).concat(Selection.points))
        {
            let radius = (LineManipulator.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position.addVector(delta), radius + this.outlineSize * 0.5 / Camera.zoom, this.outlineSize / Camera.zoom, Settings.selectionColor, false, false, true)
        }
    }

    static drawObjects() {
        if (Logic.currentState != StateEnum.GRABBING) 
            this.drawSelectionOutline(new Vector2(0, 0));

        for (let layer of File.layers)
            this.drawLayer(layer);


        // selected points
        if (Logic.currentState != StateEnum.GRABBING) {
            for (let p of Selection.points.concat(Selection.getUnselectedPointsOfPartialLines()).concat(Utilities.linesToLineEndings(Selection.lines))) {
                let radius = (!Logic.isPreviewing() && LineManipulator.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
                this.drawRealCircle(p.position, radius, 0, p.line.color, false, false, true);
            }
        }

        // selected lines. dotted if origin while moving lines
        let movingLines = Logic.currentState == StateEnum.GRABBING;
        for (let line of Selection.lines.concat(Selection.partialLines))
        {
            if (movingLines)
                context.setLineDash([line.thickness * 6 * Camera.zoom, line.thickness * 4 * Camera.zoom]);


            let thickness = movingLines ? line.thickness * 0.5 : line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position, line.end.position, thickness, line.color);

            if (!Logic.isPreviewing())
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

    static drawLayer(layer) {
        if (!layer.visible)
            return;
        let thickness;

        if (!Logic.isPreviewing() && layer != File.currentLayer) {
            thickness *= 0.5;
        }

        
        for (let line of layer.lines)
        {

            let thickness = line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position, line.end.position, thickness, color);

            if (!Logic.isPreviewing())
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(line.start.position.mirrorX(), line.end.position.mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(line.start.position.mirrorY(), line.end.position.mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(line.start.position.flipped(), line.end.position.flipped(), thickness, color);
        }

        for (let p of Utilities.linesToLineEndings(layer.lines))
        {
            let radius = (layer == File.currentLayer && !Logic.isPreviewing() && LineManipulator.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position, radius, 0, p.line.color, false, false, true)
        }
    }

    static drawPreviewLine() {
        if (Logic.currentState == StateEnum.DRAWING) {
            let start = MouseHandler.downPoint;
            let end = currentPosition;
            this.drawLineFromTo(start, end, currentLineThickness, Settings.previewLineColor, false);
        }

        this.drawRealCircle(currentPosition, currentLineThickness * 0.5, 1, currentLineColor.toString(), false, true, true);
        this.drawRealCircle(selectionCursor, cursorRange, 2, Settings.selectionColor, false, true);
    }

    static drawMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MouseHandler.grabStartPosition);
        this.drawSelectionOutline(delta);

        let other;

        // selected lines
        for (let line of Selection.lines)
        {
            let thickness = line.thickness;
            let color = line.color.copy();

            this.drawLineFromTo(line.start.position.addVector(delta), line.end.position.addVector(delta), thickness, color);

            if (!Logic.isPreviewing()) 
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(line.start.position.addVector(delta).mirrorX(), line.end.position.addVector(delta).mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(line.start.position.addVector(delta).mirrorY(), line.end.position.addVector(delta).mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(line.start.position.addVector(delta).flipped(), line.end.position.addVector(delta).flipped(), thickness, color);
        }

        // partially selected lines
        for (let point of Selection.points) {
            let p = point.position.addVector(delta);

            let thickness = point.line.thickness;
            let color = point.line.color.copy();

            this.drawLineFromTo(p, point.opposite.position, thickness, color, false);

            if (!Logic.isPreviewing())
                color.a = 0.3;

            if (mirrorX)
                this.drawLineFromTo(p.mirrorX(), point.opposite.position.mirrorX(), thickness, color);
            if (mirrorY)
                this.drawLineFromTo(p.mirrorY(), point.opposite.position.mirrorY(), thickness, color);
            if (mirrorX && mirrorY)
                this.drawLineFromTo(p.flipped(), point.opposite.position.flipped(), thickness, color);
        }

        // selected points
        for (let p of Utilities.linesToLineEndings(Selection.lines).concat(Selection.points)) {
            let radius = (!Logic.isPreviewing() && LineManipulator.showHandles) ? p.line.thickness * this.handleSizeFactor : p.line.thickness * 0.5;
            this.drawRealCircle(p.position.addVector(delta), radius, 0, p.line.color, false, false, true);
        }
    }

    static drawCrosshair() {
        let screenpos = Camera.canvasSpaceToScreenSpace(selectionCursor.copy());
        this.drawLineFromTo(new Vector2(0, screenpos.y), new Vector2(canvas.width, screenpos.y), Settings.helperLineWidth, Settings.selectionColor, true, true, true);
        this.drawLineFromTo(new Vector2(screenpos.x, 0), new Vector2(screenpos.x, canvas.height), Settings.helperLineWidth, Settings.selectionColor, true, true, true);
    }

    static drawBorderSelection() {
        if (Logic.currentState != StateEnum.BORDERSelection || !Utilities.borderSelectionStart || !Utilities.borderSelectionEnd)
            return;

        context.strokeStyle = Settings.selectionColor;
        context.fillStyle = Settings.borderSelectionColor;

        let leftTop = Camera.canvasSpaceToScreenSpace(Utilities.borderSelectionStart);
        let sizeCanvasSpace = Utilities.borderSelectionEnd.subtractVector(Utilities.borderSelectionStart);
        let size = sizeCanvasSpace.multiply(Camera.zoom);

        context.rect(leftTop.x, leftTop.y, size.x, size.y);
        context.fillRect(leftTop.x, leftTop.y, size.x, size.y);
        context.stroke();
    }
}