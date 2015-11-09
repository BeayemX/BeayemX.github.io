"use strict"


// TODO FIXME super ugly. if i call these methods directly 'this' refers to the caller and not to the class any more...
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
    }

    MouseMove(e)
    {
        var newPos = GetMousePos(e);

	    if (!isPanning)
	    {
	        var oldGridPoint = GetGridPos(this.oldPos);
	        currentGridPosition = GetGridPos(newPos);
	        var gridPosDelta = new Vector2(
			    currentGridPosition.x - oldGridPoint.x,
			    currentGridPosition.y - oldGridPoint.y
		    );
		    if (gridPosDelta.x != 0 || gridPosDelta.y != 0) {
		        this.GridPositionChanged(e, gridPosDelta);
		        WriteToStatusbarLeft("x: " + currentGridPosition.x + " | " + "y: " + currentGridPosition.y);
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
		    Redraw();
	    }

	    this.oldPos = newPos;
    }

    GridPositionChanged(e, delta)
    {
	    if (currentState == StateEnum.GRABBING)
	    {
	        var points = GetAllSelectedPoints();
	        MovePointsBy(points, delta);
        }
	    else if (currentState == StateEnum.BORDERSELECTION)
	    {
		    if (borderSelectionStart)
		    {
			    borderSelectionEnd = {x: currentGridPosition.x, y: currentGridPosition.y};
		    }
	    }

	    Redraw();
	
	    if (currentState == StateEnum.IDLE || currentState == StateEnum.DRAWING)
	    {
		    DrawPreview(e);
	    }
    }

    MouseDown(e)
    {
	    var point = GetMousePos(e);

	    if (e.button == 0) // LMB
	    {
		    if (currentState == StateEnum.IDLE)
		    {
			    SetState(StateEnum.DRAWING);
			    this.downPoint = new Vector2(point.x, point.y);
			    this.GridPositionChanged();
		    }
		    else if (currentState == StateEnum.GRABBING)
		    {
		        // TODO HACK FIXME simulate cancel grab to reset grabbed-delta, because when action is
                // added to history it will call Do()...
		        var resetDelta = {
		            x: grabStartPosition.x - currentGridPosition.x,
		            y: grabStartPosition.y - currentGridPosition.y
		        };
		        MovePointsBy(GetAllSelectedPoints(), resetDelta, true);
			    CheckForCrapLines();
			    SetState(StateEnum.IDLE);
			    Redraw();
		    }
		    else if (currentState == StateEnum.BORDERSELECTION)
		    {
			    StartBorderSelection(true);
		    }
	    }
	    else if (e.button == 2) // RMB
	    {
		    if (currentState == StateEnum.IDLE)
		    {
			    if (!e.shiftKey)
				    ClearSelection();
			    points = GetNearestSelection(point);
			    ChangeSelectionForPoints(points);
		    }
		    else if (currentState == StateEnum.GRABBING) // cancel grab
		    {
		        SetState(StateEnum.IDLE);
		        var resetDelta = {
		            x: grabStartPosition.x - currentGridPosition.x,
		            y: grabStartPosition.y - currentGridPosition.y
		        };
			    var points = GetAllSelectedPoints();
			    MovePointsBy(points, resetDelta);
		    }
		    else if (currentState == StateEnum.BORDERSELECTION)
		    {
			    EndBorderSelection();
		    }
		    Redraw();
	    }
	    else if (e.button == 1) // MMB
	    {

		    if (currentState == StateEnum.BORDERSELECTION)
		    {
			    StartBorderSelection(false);
		    }
		    else
		    {
			    var screenPos = GetMousePos(e);
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
		    if (currentState == StateEnum.DRAWING)
		    {
		        var point = GetMousePos(e);
			    this.gridLineStart = GetGridPos(this.downPoint);
			    this.gridLineEnd = GetGridPos(point);

			    if (this.gridLineStart.x != this.gridLineEnd.x || this.gridLineStart.y != this.gridLineEnd.y)
				    lines.push(
					    new Line(
						    this.gridLineStart.x,
						    this.gridLineStart.y,
						    this.gridLineEnd.x,
						    this.gridLineEnd.y
						    ));
			    CheckForCrapLines();
			    this.downPoint = undefined;
			    SetState(StateEnum.IDLE);
			    this.GridPositionChanged();
		    }
		    else if (currentState == StateEnum.BORDERSELECTION)
		    {
			    EndBorderSelection(true);
		    }
	    }

	    else if (e.button == 1) // MMB
	    {

		    if (currentState == StateEnum.BORDERSELECTION)
		    {
			    EndBorderSelection(true);
		    }
		    else
		    {
			    isPanning = false;
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
	    Redraw();
    }

    Zoom(delta)
    {
	    gridSize *= delta;
    }
}