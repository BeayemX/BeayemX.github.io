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
        Camera.multiplyZoomBy(1, true);
        this.mouseMoved(new Vector2(0, 0));
    }

    static mouseMove(e) {
        this.mouseMoved(Utilities.getMousePos(e));
    }

    static mouseMoved(newPosScreenSpace) {
        let screenPosDelta = newPosScreenSpace.subtractVector(this.oldPosScreenSpace);


        if (Logic.currentState == StateEnum.ZOOMING) {
            // TODO ctrl+mmb zoom is MAGIC
            //Camera.setZoom(this.startZoom + (newPosScreenSpace.y - this.zoomInitScreenPos.y) / canvas.height * 4, true);
            Camera.zoomBy(
                (newPosScreenSpace.y - this.zoomInitScreenPos.y)
                / canvas.height
                * Camera.zoom
                * 4
                ,
                true);
            this.zoomInitScreenPos = newPosScreenSpace;
        }
        else if (Logic.currentState == StateEnum.PANNING) {
            Camera.canvasOffset = Camera.canvasOffset.addVector(screenPosDelta.divide(Camera.zoom));
            Renderer.redraw();
        }
        else {
            selectionCursor = Camera.screenSpaceToCanvasSpace(newPosScreenSpace.copy());
            currentPosition = selectionCursor.copy();

            if ((snapToGrid && !tmpSwitchSnapToGrid) || (!snapToGrid && tmpSwitchSnapToGrid)) // TODO should also change button text
                currentPosition = GridManager.grid.getNearestPointFor(currentPosition);

            let gridDelta = currentPosition.subtractVector(this.oldPos) // TODO maybe not used anymore after grabbing reworked?
            this.cursorPositionChanged(gridDelta, screenPosDelta);

            this.oldPos = currentPosition;

            if (this.LMBDown && Logic.currentState == StateEnum.CONTINOUSDRAWING) {

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

        //GUI.writeToStats("Camera.canvasOffset", Camera.canvasOffset.toString());
        this.oldPosScreenSpace = newPosScreenSpace;
    }

    static cursorPositionChanged(gridDelta, screenPosDelta) {
        if (Logic.currentState == StateEnum.BORDERSelection) {
            if (Utilities.borderSelectionStart) {
                Utilities.borderSelectionEnd = selectionCursor.copy();
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
                if (Logic.currentState == StateEnum.IDLE) {
                    Logic.setState(StateEnum.DRAWING);
                    this.downPoint = currentPosition.copy();
                }
                else if (Logic.currentState == StateEnum.GRABBING) {
                    this.endMoveLinesPreview();
                }
                else if (Logic.currentState == StateEnum.BORDERSelection) {
                    Utilities.startAreaSelection(true);
                }
                else if (Logic.currentState == StateEnum.CONTINOUSDRAWING) {
                    this.continousDrawingOldPos = continousDrawingInstantSnap ? currentPosition.copy() : selectionCursor.copy();
                }
            }
            else if (e.button == 2) // RMB
            {
                if (Logic.currentState == StateEnum.IDLE) {
                    if (!e.shiftKey)
                        Selection.clearSelection();

                    let lines = File.currentLayer.lines.concat(Selection.lines).concat(Selection.partialLines);
                    let pointsToChangeSelection = [];

                    // TODO weird number but should be a third?
                    let limit = 0.25;

                    for (let i = 0; i < lines.length; i++) {
                        if (Utilities.distancePointToLine(selectionCursor, lines[i]) <= cursorRange) {
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

                    Selection.changeSelectionForPoints(pointsToChangeSelection);

                    if (pointsToChangeSelection != null) {
                        MouseHandler.startMoveLinesPreview();

                        Logic.setState(StateEnum.GRABBING);
                        this.grabInitializedWithRMBDown = true;
                    }
                }
                else if (Logic.currentState == StateEnum.BORDERSelection) {
                    Utilities.endAreaSelection();
                }
                else if (Logic.currentState == StateEnum.DRAWING) {
                    this.cancelLinePreview();
                }

                Renderer.redraw();
            }
            else if (e.button == 1) // MMB
            {
                if (Logic.currentState == StateEnum.BORDERSelection) {
                    Utilities.startAreaSelection(false);
                }
                else if (e.ctrlKey) {
                    this.zoomInitScreenPos = Utilities.getMousePos(e);
                    this.startZoom = Camera.zoom;
                    Logic.setState(StateEnum.ZOOMING);
                }
                else {
                    var screenPos = Utilities.getMousePos(e);
                    Logic.setState(StateEnum.PANNING);
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
                LineManipulator.growSelection(true);
            }

        }
        else if (e.detail == 3) {

            if (e.button == 2) {// RMB
                LineManipulator.selectLinked();
            }
        }

        e.preventDefault();
    }

    static mouseUp(e) {
        this.adjustMouseDownButtonBools(e, false);

        if (e.button == 0) // LMB
        {
            if (Logic.currentState == StateEnum.DRAWING) {
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
            else if (Logic.currentState == StateEnum.BORDERSelection) {
                Utilities.endAreaSelection(true);
            }
            else if (Logic.currentState == StateEnum.CONTINOUSDRAWING) {
                this.continousDrawingOldPos = undefined;
            }
        }

        else if (e.button == 1) // MMB
        {
            if (Logic.currentState == StateEnum.BORDERSelection) {
                Utilities.endAreaSelection(true);
            }
            else if (Logic.currentState == StateEnum.ZOOMING) {
                Logic.setState(Logic.previousState);
                this.zoomInitScreenPos = undefined;
                this.startZoom = undefined;
            }
            else {
                Logic.setState(Logic.previousState);
            }
        }
        else if (e.button == 2) // RMB
        {
            if (Logic.currentState == StateEnum.GRABBING) // cancel grab
            {
                let delta = currentPosition.subtractVector(this.grabStartPosition);
                let points = Selection.getAllSelectedPoints();

                if (this.grabInitializedWithRMBDown)
                    Utilities.moveSelectionBy(points, delta);
                else
                    this.cancelMoveLinesPreview();

                //File.cleanUpFile();

                this.grabInitializedWithRMBDown = false;
                grabInitializedWithKeyboard = false;
                Logic.setState(StateEnum.IDLE);
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
                Camera.multiplyZoomBy(1.1, true);
            else if (e.deltaY > 0)
                Camera.multiplyZoomBy(0.9, true);

            this.mouseMove(e);
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
        Logic.setState(StateEnum.IDLE);
    }

    static startMoveLinesPreview() {
        this.grabStartPosition = currentPosition.copy();
    }

    static endMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MouseHandler.grabStartPosition);
        Utilities.moveSelectionBy(Selection.getAllSelectedPoints(), delta);

        grabInitializedWithKeyboard = false;
        Logic.setState(StateEnum.IDLE);
        Renderer.redraw();
    }

    static cancelMoveLinesPreview() {
    }
}