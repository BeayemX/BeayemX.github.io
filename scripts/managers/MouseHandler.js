class MouseHandler {
    static init() {
        console.log("MouseHandler created.");

        this.downPoint = new Vector2(-1, -1); // TODO rename downPointScreenpos
        this.gridLineStart;
        this.gridLineEnd;
        this.oldPos = new Vector2(-1, -1);
        this.oldPosScreenSpace = new Vector2(0, 0);
        this.grabInitializedWithRMBDown = false;

        this.grabStartPosition;

        waitingForStart.push(this);
    }

    static start() {
        CAMERA.multiplyZoomBy(1, true);
        this.mouseMoved(new Vector2(0, 0));
    }

    static mouseMove(e) {
        this.mouseMoved(UTILITIES.getMousePos(e));
    }

    static mouseMoved(newPosScreenSpace) {
        let screenPosDelta = newPosScreenSpace.subtractVector(this.oldPosScreenSpace);


        if (LOGIC.currentState == StateEnum.ZOOMING) {
            // TODO ctrl+mmb zoom is MAGIC
            //CAMERA.setZoom(this.startZoom + (newPosScreenSpace.y - this.zoomInitScreenPos.y) / canvas.height * 4, true);
            CAMERA.zoomBy(
                (newPosScreenSpace.y - this.zoomInitScreenPos.y)
                / canvas.height
                * CAMERA.zoom
                * 4
                ,
                true);
            this.zoomInitScreenPos = newPosScreenSpace;
        }
        else if (LOGIC.currentState == StateEnum.PANNING) {
            CAMERA.canvasOffset = CAMERA.canvasOffset.addVector(screenPosDelta.divide(CAMERA.zoom));
            Renderer.redraw();
        }
        else {
            selectionCursor = CAMERA.screenSpaceToCanvasSpace(newPosScreenSpace.copy());
            currentPosition = selectionCursor.copy();

            if ((snapToGrid && !tmpSwitchSnapToGrid) || (!snapToGrid && tmpSwitchSnapToGrid)) // TODO should also change button text
                currentPosition = GRID.grid.getNearestPointFor(currentPosition);

            let gridDelta = currentPosition.subtractVector(this.oldPos) // TODO maybe not used anymore after grabbing reworked?
            this.cursorPositionChanged(gridDelta, screenPosDelta);

            this.oldPos = currentPosition;

            if (this.LMBDown && LOGIC.currentState == StateEnum.CONTINOUSDRAWING) {

                if (this.continousDrawingOldPos != undefined) {
                    let gridLineStart = this.continousDrawingOldPos.copy();
                    let gridLineEnd = continousDrawingInstantSnap ? currentPosition.copy() : selectionCursor.copy();


                    if (gridLineStart.x != gridLineEnd.x || gridLineStart.y != gridLineEnd.y)
                        File.addLine(
                            new Line(
                                gridLineStart.x,
                                gridLineStart.y,
                                gridLineEnd.x,
                                gridLineEnd.y
                                ));
                }

                if (continousDrawingInstantSnap)
                    this.continousDrawingOldPos = currentPosition.copy();
                else
                    this.continousDrawingOldPos = selectionCursor.copy();

            }

            GUI.writeToStatusbarLeft(currentPosition.toString());
        }

        //GUI.writeToStats("CAMERA.canvasOffset", CAMERA.canvasOffset.toString());
        this.oldPosScreenSpace = newPosScreenSpace;
    }

    static cursorPositionChanged(gridDelta, screenPosDelta) {
        if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
            if (UTILITIES.borderSelectionStart) {
                UTILITIES.borderSelectionEnd = selectionCursor.copy();
            }
        }

        Renderer.redraw();
    }

    static adjustMouseDownButtonBools(e, state) {
        if (e.button == 0)
            this.LMBDown = state;
        if (e.button == 1)
            this.MMBDown = state;
        if (e.button == 2)
            this.RMBDown = state;

        GUI.writeToStats("LMB down", this.LMBDown);
        GUI.writeToStats("MMB down", this.MMBDown);
        GUI.writeToStats("RMB down", this.RMBDown);
    }

    static mouseDown(e) {
        this.adjustMouseDownButtonBools(e, true);

        if (e.detail == 1) {
            if (e.button == 0) // LMB
            {
                if (LOGIC.currentState == StateEnum.IDLE) {
                    LOGIC.setState(StateEnum.DRAWING);
                    this.downPoint = currentPosition.copy();
                }
                else if (LOGIC.currentState == StateEnum.GRABBING) {
                    this.endMoveLinesPreview();
                }
                else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                    UTILITIES.startAreaSelection(true);
                }
                else if (LOGIC.currentState == StateEnum.CONTINOUSDRAWING) {
                    this.continousDrawingOldPos = continousDrawingInstantSnap ? currentPosition.copy() : selectionCursor.copy();
                }
            }
            else if (e.button == 2) // RMB
            {
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (!e.shiftKey)
                        SELECTION.clearSelection();

                    let lines = File.currentLayer.lines.concat(SELECTION.lines).concat(SELECTION.partialLines);
                    let pointsToChangeSelection = [];

                    // TODO weird number but should be a third?
                    let limit = 0.25;

                    for (let i = 0; i < lines.length; i++) {
                        if (UTILITIES.distancePointToLine(selectionCursor, lines[i]) <= cursorRange) {
                            // TODO PERFORMANCE
                            let startDist = lines[i].start.position.subtractVector(selectionCursor).sqrMagnitude();
                            let endDist = lines[i].end.position.subtractVector(selectionCursor).sqrMagnitude();

                            if (startDist < endDist * limit)
                                pointsToChangeSelection.push(lines[i].start);
                            else if (endDist < startDist * limit)
                                pointsToChangeSelection.push(lines[i].end);
                            else {
                                pointsToChangeSelection.push(lines[i].start);
                                pointsToChangeSelection.push(lines[i].end);
                            }
                        }
                    }

                    SELECTION.changeSelectionForPoints(pointsToChangeSelection);

                    if (pointsToChangeSelection != null) {
                        MouseHandler.startMoveLinesPreview();

                        LOGIC.setState(StateEnum.GRABBING);
                        this.grabInitializedWithRMBDown = true;
                    }
                }
                else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                    UTILITIES.endAreaSelection();
                }
                else if (LOGIC.currentState == StateEnum.DRAWING) {
                    this.cancelLinePreview();
                }

                Renderer.redraw();
            }
            else if (e.button == 1) // MMB
            {
                if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                    UTILITIES.startAreaSelection(false);
                }
                else if (e.ctrlKey) {
                    this.zoomInitScreenPos = UTILITIES.getMousePos(e);
                    this.startZoom = CAMERA.zoom;
                    LOGIC.setState(StateEnum.ZOOMING);
                }
                else {
                    var screenPos = UTILITIES.getMousePos(e);
                    LOGIC.setState(StateEnum.PANNING);
                }
            }
            else {
                console.log("Mouse button: \n"
                    + "button: " + e.button + "\n"
                    + "ctrlKey: " + e.ctrlKey + "\n"
                    + "altKey: " + e.altKey + "\n"
                    + "shiftKey: " + e.shiftKey + "\n"
                    );
            }
        }
        else if (e.detail == 2) {
            if (e.button == 0) { // LMB 

            }
            else if (e.button == 1) {// MMB

            }
            else if (e.button == 2) {// RMB
                LINE_MANIPULATOR.growSelection(true);
            }

        }
        else if (e.detail == 3) {

            if (e.button == 2) {// RMB
                LINE_MANIPULATOR.selectLinked();
            }
        }

        e.preventDefault();
    }

    static mouseUp(e) {
        this.adjustMouseDownButtonBools(e, false);

        if (e.button == 0) // LMB
        {
            if (LOGIC.currentState == StateEnum.DRAWING) {
                this.gridLineStart = this.downPoint;
                this.gridLineEnd = currentPosition.copy();

                if (this.gridLineStart.x != this.gridLineEnd.x || this.gridLineStart.y != this.gridLineEnd.y)
                    File.addLine(
					    new Line(
						    this.gridLineStart.x,
						    this.gridLineStart.y,
						    this.gridLineEnd.x,
						    this.gridLineEnd.y
						    ));

                if (drawPolyLine)
                    this.downPoint = currentPosition.copy();
                else
                    this.cancelLinePreview();
            }
            else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                UTILITIES.endAreaSelection(true);
            }
            else if (LOGIC.currentState == StateEnum.CONTINOUSDRAWING) {
                this.continousDrawingOldPos = undefined;
            }
        }

        else if (e.button == 1) // MMB
        {
            if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                UTILITIES.endAreaSelection(true);
            }
            else if (LOGIC.currentState == StateEnum.ZOOMING) {
                LOGIC.setState(LOGIC.previousState);
                this.zoomInitScreenPos = undefined;
                this.startZoom = undefined;
            }
            else {
                LOGIC.setState(LOGIC.previousState);
            }
        }
        else if (e.button == 2) // RMB
        {
            if (LOGIC.currentState == StateEnum.GRABBING) // cancel grab
            {
                let delta = currentPosition.subtractVector(this.grabStartPosition);
                let points = SELECTION.getAllSelectedPoints();

                if (this.grabInitializedWithRMBDown)
                    UTILITIES.moveSelectionBy(points, delta);
                else
                    this.cancelMoveLinesPreview();

                //File.cleanUpFile();

                this.grabInitializedWithRMBDown = false;
                grabInitializedWithKeyboard = false;
                LOGIC.setState(StateEnum.IDLE);
                Renderer.redraw();
            }
        }
    }

    static mouseScroll(e) {
        if (e.ctrlKey) {
            let step = 1;
            if (e.deltaY < 0)
                currentLineThickness += step;
            else if (e.deltaY > 0)
                currentLineThickness = Math.max(currentLineThickness - step, 1);
        }

        if (e.shiftKey) {
            let step = 1;
            if (e.deltaX < 0)
                cursorRange += step;
            else if (e.deltaX > 0)
                cursorRange = Math.max(cursorRange - step, 1);
        }

        if (!e.shiftKey && !e.ctrlKey) {
            if (e.deltaY < 0) // upscroll
                CAMERA.multiplyZoomBy(1.1, true);
            else if (e.deltaY > 0)
                CAMERA.multiplyZoomBy(0.9, true);

            this.MouseMove(e);
        }

        Renderer.redraw();

        e.preventDefault();
    }

    static canvasMouseEnter() {
        this.canvasFocused = true;
        GUI.writeToStats("Canvas focused", this.canvasFocused);
    }

    static canvasMouseLeave() {
        this.canvasFocused = false;
        GUI.writeToStats("Canvas focused", this.canvasFocused);
    }

    static cancelLinePreview() {
        this.downPoint = undefined;
        LOGIC.setState(StateEnum.IDLE);
    }

    static startMoveLinesPreview() {
        this.grabStartPosition = currentPosition.copy();
    }

    static endMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MouseHandler.grabStartPosition);
        UTILITIES.moveSelectionBy(SELECTION.getAllSelectedPoints(), delta);

        grabInitializedWithKeyboard = false;
        LOGIC.setState(StateEnum.IDLE);
        Renderer.redraw();
    }

    static cancelMoveLinesPreview() {
    }
}