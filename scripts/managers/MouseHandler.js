"use strict"
class MouseHandler {
    constructor() {
        console.log("MouseHandler created.");

        this.downPoint = new Vector2(-1, -1); // TODO rename downPointScreenpos
        this.gridLineStart;
        this.gridLineEnd;
        this.oldPos = new Vector2(-1, -1);
        this.grabInitializedWithRMBDown = false;
        this.isPanning = false;
    }

    MouseMove(e) {
        let newPos = UTILITIES.getMousePos(e);

        if (!this.isPanning) {
            let p = DRAW_MANAGER.screenSpaceToCanvasSpace(newPos.copy());
            currentPosition = new Point(p.x, p.y);
                
            let text = "curPos: " + currentPosition.toString();
            text += "\tcanvasOffset: " + canvasOffset.toString();
            GUI.writeToStatusbarLeft(text);;
        }
        else // while panning
        {
            var screenPosDelta = {
                x: newPos.x - this.oldPos.x,
                y: newPos.y - this.oldPos.y
            }

            canvasOffset.x += screenPosDelta.x / zoom;
            canvasOffset.y += screenPosDelta.y / zoom;
        }

        DRAW_MANAGER.redraw(); // TODO with grid stuff, redraw just happened if currentGridPoint changed...
        this.oldPos = newPos;
    }

    GridPositionChanged(e, delta) {
        if (LOGIC.currentState == StateEnum.GRABBING) {
            var points = DATA_MANAGER.currentFile.getAllSelectedPoints();
            UTILITIES.movePointsBy(points, delta);
        }
        else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
            if (UTILITIES.borderSelectionStart) {
                UTILITIES.borderSelectionEnd = { x: currentPosition.x, y: currentPosition.y };
            }
        }

        DRAW_MANAGER.redraw();
    }

    MouseDown(e) {
        let point = UTILITIES.getMousePos(e);
        let canvasSpacePoint = DRAW_MANAGER.screenSpaceToCanvasSpace(point.copy());
        canvasSpacePoint = new Point(canvasSpacePoint.x, canvasSpacePoint.y); // TODO ugly workaround

        if (e.button == 0) // LMB
        {
            if (LOGIC.currentState == StateEnum.IDLE) {
                LOGIC.setState(StateEnum.DRAWING);
                this.downPoint = canvasSpacePoint.copy();
                this.GridPositionChanged();
            }
            else if (LOGIC.currentState == StateEnum.GRABBING) {
                // TODO HACK FIXME simulate cancel grab to reset grabbed-delta, because when action is
                // added to history it will call Do()...
                var resetDelta = {
                    x: KEYBOARD_HANDLER.grabStartPosition.x - currentPosition.x,
                    y: KEYBOARD_HANDLER.grabStartPosition.y - currentPosition.y
                };
                UTILITIES.movePointsBy(DATA_MANAGER.currentFile.getAllSelectedPoints(), resetDelta, true);
                DATA_MANAGER.currentFile.cleanUpFile();
                grabInitializedWithKeyboard = false;
                LOGIC.setState(StateEnum.IDLE);
                DRAW_MANAGER.redraw();
            }
            else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                UTILITIES.startAreaSelection(true);
            }
        }
        else if (e.button == 2) // RMB
        {
            if (LOGIC.currentState == StateEnum.IDLE) {
                if (!e.shiftKey)
                    DATA_MANAGER.currentFile.clearSelection();
                let points = UTILITIES.getNearestSelection(canvasSpacePoint);
                UTILITIES.changeSelectionForPoints(points);

                if (points != null) {
                    KEYBOARD_HANDLER.grabStartPosition = {
                        x: currentPosition.x,
                        y: currentPosition.y
                    };

                    LOGIC.currentState = StateEnum.GRABBING;
                    this.grabInitializedWithRMBDown = true;
                }
            }
            else if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
                UTILITIES.endAreaSelection();
            }
            else if (LOGIC.currentState == StateEnum.DRAWING) {
                this.CancelLinePreview();
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
        e.preventDefault();
    }

    MouseUp(e) {
        if (e.button == 0) // LMB
        {
            if (LOGIC.currentState == StateEnum.DRAWING) {
                let point = UTILITIES.getMousePos(e);
                let canvasSpacePoint = DRAW_MANAGER.screenSpaceToCanvasSpace(point.copy());
                this.gridLineStart = this.downPoint;
                this.gridLineEnd = canvasSpacePoint;

                if (this.gridLineStart.x != this.gridLineEnd.x || this.gridLineStart.y != this.gridLineEnd.y)
                    DATA_MANAGER.currentFile.addLine(
					    new Line(
						    this.gridLineStart.x,
						    this.gridLineStart.y,
						    this.gridLineEnd.x,
						    this.gridLineEnd.y
						    ));

                if (ctrlDown)
                    this.downPoint = canvasSpacePoint;
                else
                    this.CancelLinePreview();

                this.GridPositionChanged();
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
                let resetDelta = {
                    x: KEYBOARD_HANDLER.grabStartPosition.x - currentPosition.x,
                    y: KEYBOARD_HANDLER.grabStartPosition.y - currentPosition.y
                };

                if (this.grabInitializedWithRMBDown == false) {
                    let points = DATA_MANAGER.currentFile.getAllSelectedPoints();
                    UTILITIES.movePointsBy(points, resetDelta);
                }
                else {
                    UTILITIES.movePointsBy(DATA_MANAGER.currentFile.getAllSelectedPoints(), resetDelta, true);
                    DATA_MANAGER.currentFile.cleanUpFile();
                }
                this.grabInitializedWithRMBDown = false;
                grabInitializedWithKeyboard = false;
                LOGIC.setState(StateEnum.IDLE);
                DRAW_MANAGER.redraw();
            }
        }
    }

    MouseScroll(e) {
        if (e.deltaY < 0) // upscroll
            this.Zoom(1.1);
        else
            this.Zoom(0.9);

        this.MouseMove(e);
        DRAW_MANAGER.redraw();
    }

    MouseLeave() {
        if (LOGIC.currentState == StateEnum.GRABBING) {
            // TODO should place cursor on other side of the canvas... 
            // but doesn't work due to security reasons...
        }
    }

    Zoom(delta) {
        // TODO maybe there is a better option than saving center and comparing difference?
        let center = new Vector2(canvas.width * 0.5, canvas.height * 0.5);
        let worldCenter = DRAW_MANAGER.screenSpaceToCanvasSpace(center);

        zoom *= delta;

        let newWorldCenter = DRAW_MANAGER.screenSpaceToCanvasSpace(center);
        let diff = newWorldCenter.SubtractVector(worldCenter);
        canvasOffset = canvasOffset.AddVector(diff);

    }

    CancelLinePreview() {
        this.downPoint = undefined;
        LOGIC.setState(StateEnum.IDLE);
    }
}