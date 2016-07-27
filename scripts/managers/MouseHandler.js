class MouseHandler {
    constructor() {
        console.log("MouseHandler created.");

        this.downPoint = new Vector2(-1, -1); // TODO rename downPointScreenpos
        this.gridLineStart;
        this.gridLineEnd;
        this.oldPos = new Vector2(-1, -1);
        this.oldPosScreenSpace = new Vector2(0, 0);
        this.grabInitializedWithRMBDown = false;
        this.isPanning = false;

        this.grabStartPosition;

        waitingForStart.push(this);
    }

    start() {
        CAMERA.zoomBy(1);
        this.mouseMoved(new Vector2(0, 0));
    }

    MouseMove(e) {
        this.mouseMoved(UTILITIES.getMousePos(e));
    }

    mouseMoved(newPosScreenSpace) {
        let screenPosDelta = newPosScreenSpace.subtractVector(this.oldPosScreenSpace);

        if (!this.isPanning) {
            selectionCursor = CAMERA.screenSpaceToCanvasSpace(newPosScreenSpace.copy());
            currentPosition = selectionCursor.copy();

            if ((snapToGrid && !tmpSwitchSnapToGrid) || (!snapToGrid && tmpSwitchSnapToGrid)) // TODO should also change button text
                currentPosition = GRID.getNearestPointFor(currentPosition);


            //if (!currentPosition.equals(this.oldPos)) 
            if (!LOGIC.isPreviewing())
            {
                let gridDelta = currentPosition.subtractVector(this.oldPos) // TODO maybe not used anymore after grabbing reworked?
                this.cursorPositionChanged(gridDelta, screenPosDelta);

                this.oldPos = currentPosition;
            }

            ;
            GUI.writeToStatusbarLeft(currentPosition.toString());
        }
        else // while panning
        {
            CAMERA.canvasOffset = CAMERA.canvasOffset.addVector(screenPosDelta.divide(CAMERA.zoom));
            DRAW_MANAGER.redraw();
        }

        //GUI.writeToStats("CAMERA.canvasOffset", CAMERA.canvasOffset.toString());
        this.oldPosScreenSpace = newPosScreenSpace;
    }

    cursorPositionChanged(gridDelta, screenPosDelta) {
        if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
            if (UTILITIES.borderSelectionStart) {
                UTILITIES.borderSelectionEnd = selectionCursor.copy();
            }
        }

        DRAW_MANAGER.redraw();
    }

    MouseDown(e) {
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
            }
            else if (e.button == 2) // RMB
            {
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (!e.shiftKey)
                        SELECTION.clearSelection();

                    let lines = FILE.currentLayer.lines.concat(SELECTION.lines).concat(SELECTION.partialLines);
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
                        MOUSE_HANDLER.startMoveLinesPreview();

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

                DRAW_MANAGER.redraw();
            }
            else if (e.button == 1) // MMB
            {
                if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                    UTILITIES.startAreaSelection(false);
                }
                else {
                    var screenPos = UTILITIES.getMousePos(e);
                    this.isPanning = true;
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

    MouseUp(e) {
        if (e.button == 0) // LMB
        {
            if (LOGIC.currentState == StateEnum.DRAWING) {
                this.gridLineStart = this.downPoint;
                this.gridLineEnd = currentPosition.copy();

                if (this.gridLineStart.x != this.gridLineEnd.x || this.gridLineStart.y != this.gridLineEnd.y)
                    FILE.addLine(
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
        }

        else if (e.button == 1) // MMB
        {
            if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                UTILITIES.endAreaSelection(true);
            }
            else {
                this.isPanning = false;
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

                //FILE.cleanUpFile();

                this.grabInitializedWithRMBDown = false;
                grabInitializedWithKeyboard = false;
                LOGIC.setState(StateEnum.IDLE);
                DRAW_MANAGER.redraw();
            }
        }
    }

    MouseScroll(e) {
        if (e.shiftKey) {
            let step = 1;
            if (e.deltaX < 0)
                cursorRange += step;
            else if (e.deltaX > 0)
                cursorRange = Math.max(cursorRange - step, 1);

        } else {
            if (e.deltaY < 0) // upscroll
                CAMERA.zoomBy(1.1);
            else if (e.deltaY > 0)
                CAMERA.zoomBy(0.9);

            this.MouseMove(e);
        }
        DRAW_MANAGER.redraw();

        e.preventDefault();
    }

    MouseLeave() {
        if (LOGIC.currentState == StateEnum.GRABBING) {
            // TODO should place cursor on other side of the canvas... 
            // but doesn't work due to security reasons...
        }
    }
    
    cancelLinePreview() {
        this.downPoint = undefined;
        LOGIC.setState(StateEnum.IDLE);
    }

    startMoveLinesPreview() {
        this.grabStartPosition = currentPosition.copy();
    }

    endMoveLinesPreview() {
        let delta = currentPosition.subtractVector(MOUSE_HANDLER.grabStartPosition);
        UTILITIES.moveSelectionBy(SELECTION.getAllSelectedPoints(), delta);

        grabInitializedWithKeyboard = false;
        LOGIC.setState(StateEnum.IDLE);
        DRAW_MANAGER.redraw();
    }

    cancelMoveLinesPreview() {
    }
}