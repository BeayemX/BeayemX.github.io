"use strict"


// SIFU TODO FIXME super ugly. if i call these methods directly 'this' refers to the caller and not to the class any more...
function MouseMove(e) {
    mouseHandler.MouseMove(e);
}
function MouseUp(e) {
    mouseHandler.MouseUp(e);
}
function MouseDown(e) {
    mouseHandler.MouseDown(e);
}
function MouseScroll(e) {
    mouseHandler.MouseScroll(e);
}
class MouseHandler
{
    constructor()
    {
        this.downPoint = new Vector2(-1, -1); // TODO rename downPointScreenpos
        this.gridLineStart;
        this.gridLineEnd;
        this.oldPos = new Vector2(-1, -1);
        this.grabInitializedWithRMBDown = false;
    }

    MouseMove(e)
    {
        var newPos = UTILITIES.getMousePos(e);

	    if (!isPanning)
	    {
	        var oldGridPoint = UTILITIES.getGridPos(this.oldPos);
	        currentGridPosition = UTILITIES.getGridPos(newPos);
	        var gridPosDelta = new Vector2(
			    currentGridPosition.x - oldGridPoint.x,
			    currentGridPosition.y - oldGridPoint.y
		    );
		    if (gridPosDelta.x != 0 || gridPosDelta.y != 0) {
		        this.GridPositionChanged(e, gridPosDelta);
		        GUI.writeToStatusbarLeft("x: " + currentGridPosition.x + " | " + "y: " + currentGridPosition.y);
            }
	    }
	    else // while panning
	    {
		    var screenPosDelta = {
		        x: newPos.x - this.oldPos.x,
		        y: newPos.y - this.oldPos.y
		    }

		    canvasOffset.x += screenPosDelta.x;
		    canvasOffset.y += screenPosDelta.y;
		    DRAW_MANAGER.redraw();
	    }

	    this.oldPos = newPos;
    }

    GridPositionChanged(e, delta)
    {
        if (LOGIC.currentState == StateEnum.GRABBING)
	    {
	        var points = DATA_MANAGER.currentFile.getAllSelectedPoints();
	        UTILITIES.movePointsBy(points, delta);
        }
        else if (LOGIC.currentState == StateEnum.BORDERSELECTION)
	    {
		    if (UTILITIES.borderSelectionStart)
		    {
		        UTILITIES.borderSelectionEnd = { x: currentGridPosition.x, y: currentGridPosition.y };
		    }
	    }

	    DRAW_MANAGER.redraw();
    }

    MouseDown(e)
    {
        var point = UTILITIES.getMousePos(e);

	    if (e.button == 0) // LMB
	    {
	        if (LOGIC.currentState == StateEnum.IDLE)
		    {
			    LOGIC.setState(StateEnum.DRAWING);
			    this.downPoint = new Vector2(point.x, point.y);
			    this.GridPositionChanged();
		    }
	        else if (LOGIC.currentState == StateEnum.GRABBING)
		    {
		        // TODO HACK FIXME simulate cancel grab to reset grabbed-delta, because when action is
                // added to history it will call Do()...
		        var resetDelta = {
		            x: keyboardHandler.grabStartPosition.x - currentGridPosition.x,
		            y: keyboardHandler.grabStartPosition.y - currentGridPosition.y
		        };
		        UTILITIES.movePointsBy(DATA_MANAGER.currentFile.getAllSelectedPoints(), resetDelta, true);
		        DATA_MANAGER.currentFile.cleanUpFile();
		        grabInitializedWithKeyboard = false;
			    LOGIC.setState(StateEnum.IDLE);
			    DRAW_MANAGER.redraw();
		    }
	        else if (LOGIC.currentState == StateEnum.BORDERSELECTION)
		    {
	            UTILITIES.startAreaSelection(true);
		    }
	    }
	    else if (e.button == 2) // RMB
	    {
	        if (LOGIC.currentState == StateEnum.IDLE)
		    {
			    if (!e.shiftKey)
				    DATA_MANAGER.currentFile.clearSelection();
			    let points = UTILITIES.getNearestSelection(point);
			    UTILITIES.changeSelectionForPoints(points);

			    if (points != null)
			    {
			        keyboardHandler.grabStartPosition = {
			            x: currentGridPosition.x,
			            y: currentGridPosition.y
			        };

			        LOGIC.currentState = StateEnum.GRABBING;
			        this.grabInitializedWithRMBDown = true;
			    }
		    }		  
	        else if (LOGIC.currentState == StateEnum.BORDERSELECTION)
		    {
			    UTILITIES.endAreaSelection();
		    }
	        else if (LOGIC.currentState == StateEnum.DRAWING)
		    {
		        this.CancelLinePreview();
		    }

		    DRAW_MANAGER.redraw();
	    }
	    else if (e.button == 1) // MMB
	    {
	        if (LOGIC.currentState == StateEnum.BORDERSELECTION)
		    {
	            UTILITIES.startAreaSelection(false);
		    }
		    else
		    {
			    var screenPos = UTILITIES.getMousePos(e);
			    isPanning = true;
		    }
	    }
	    else
	    {
		    console.log("Mouse button: \n"
			    + "button: " + e.button + "\n"
			    + "ctrlKey: " + e.ctrlKey + "\n"
			    + "altKey: " + e.altKey + "\n"
			    + "shiftKey: " + e.shiftKey + "\n"
			    );
	    }
	    e.preventDefault();
    }

    MouseUp(e)
    {
	    if (e.button == 0) // LMB
	    {
	        if (LOGIC.currentState == StateEnum.DRAWING)
		    {
		        var point = UTILITIES.getMousePos(e);
		        this.gridLineStart = UTILITIES.getGridPos(this.downPoint);
		        this.gridLineEnd = UTILITIES.getGridPos(point);

			    if (this.gridLineStart.x != this.gridLineEnd.x || this.gridLineStart.y != this.gridLineEnd.y)
                    DATA_MANAGER.currentFile.addLine(
					    new Line(
						    this.gridLineStart.x,
						    this.gridLineStart.y,
						    this.gridLineEnd.x,
						    this.gridLineEnd.y
						    ));

			    if (ctrlDown)
			        this.downPoint = point;
			    else
			        this.CancelLinePreview();

			    this.GridPositionChanged();
		    }
	        else if (LOGIC.currentState == StateEnum.BORDERSELECTION)
		    {
	            UTILITIES.endAreaSelection(true);
		    }
	    }

	    else if (e.button == 1) // MMB
	    {

	        if (LOGIC.currentState == StateEnum.BORDERSELECTION) {
	            UTILITIES.endAreaSelection(true);
	        }
	        else {
	            isPanning = false;
	        }
	    }
	    else if (e.button == 2) // RMB
	    {
	        if (LOGIC.currentState == StateEnum.GRABBING) // cancel grab
	        {
	            let resetDelta = {
	                x: keyboardHandler.grabStartPosition.x - currentGridPosition.x,
	                y: keyboardHandler.grabStartPosition.y - currentGridPosition.y
	            };

	            if (this.grabInitializedWithRMBDown == false)
	            {
	                let points = DATA_MANAGER.currentFile.getAllSelectedPoints();
	                UTILITIES.movePointsBy(points, resetDelta);
	            }
	            else
	            {
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

    MouseScroll(e)
    {
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

    Zoom(delta)
    {
	    gridSize *= delta;
    }

    CancelLinePreview()
    {
        this.downPoint = undefined;
        LOGIC.setState(StateEnum.IDLE);
    }
}