"use strict"
function GetMousePos(e)
{
	var rect = canvas.getBoundingClientRect();
	return new Vector2(
		e.clientX - rect.left,
		e.clientY - rect.top
	);
}

function GetMousePosConsideringOffset(e) 
{
	var rect = canvas.getBoundingClientRect();
	return new Vector2(
		e.clientX - rect.left - canvasOffset.x,
		e.clientY - rect.top - canvasOffset.y
	);
}

function GridpointToScreenpoint(gridpoint)
{
	return new Vector2(
		gridpoint.x * gridSize + canvasOffset.x,
		gridpoint.y * gridSize + canvasOffset.y
	);
}


function GetGridPos(screenPos) // TODO rename to ScreenpointToGridpoint
{
	var x = new GridPoint(
		Math.round((screenPos.x - canvasOffset.x) / gridSize),	
		Math.round((screenPos.y - canvasOffset.y) / gridSize)
	);
	return x;

}

function ReloadPage(ask)
{
	if (ask &&  confirm("Do you want to discard your LogoDesign?") 
		|| !ask)
			location.reload();

}

function DeleteArrayEntry(array, entry)
{
	for (var i=0; i<array.length; ++i)
	{
		if (array[i] == entry)
		{
			array.splice(i, 1);
		}
	}
}

function SelectPoints(points, value) // TODO rename setSelectionForPoints
{
	if (arguments.length == 1)
		value = true;
	for (var i=0; i<points.length; ++i)
	{
		points[i].selected = value;
	}
}

function ChangeSelectionForPoints(points)
{
	for (var i=0; i<points.length; ++i)
	{
		points[i].selected = !points[i].selected;
	}
}

function MovePointsBy(points, delta, createHistory)
{
    for (var i = 0; i < points.length; ++i) {
        points[i].x += delta.x;
        points[i].y += delta.y;
    }

    if (arguments.length == 3)
    {
        if (delta.x != 0 || delta.y != 0)
        {
            var curr = { x: currentGridPosition.x, y: currentGridPosition.y };
            var start = { x: keyboardHandler.grabStartPosition.x, y: keyboardHandler.grabStartPosition.y };
            actionhistory.PushAction(new MoveAction(points, curr, start));
        }
    }
}

var borderSelectionStart = null;
var borderSelectionEnd = null;
var borderSelectType = null;
function StartBorderSelection(selectType)
{
	borderSelectType = selectType
	borderSelectionStart = {x: currentGridPosition.x, y: currentGridPosition.y};
	borderSelectionEnd = {x: currentGridPosition.x, y: currentGridPosition.y};
}

function EndBorderSelection(performSelection)
{
	if (performSelection)
		SelectWithinBorderSelection();

	borderSelectionStart = null;
	borderSelectionEnd = null;
	borderSelectType = null;

	SetState(StateEnum.IDLE);

	Redraw();
}

function SelectWithinBorderSelection()
{
    var points = currentProject.currentFile.GetAllPoints();

	var min = {
		x: Math.min(borderSelectionStart.x, borderSelectionEnd.x),
		y: Math.min(borderSelectionStart.y, borderSelectionEnd.y)
	};
	var max = {
		x: Math.max(borderSelectionStart.x, borderSelectionEnd.x),
		y: Math.max(borderSelectionStart.y, borderSelectionEnd.y)
	};

	for (var i=0; i<points.length; ++i)
	{
		if (
			points[i].x >= min.x && points[i].x <= max.x
			&& 
			points[i].y >= min.y && points[i].y <= max.y
			)
			points[i].selected = borderSelectType;
	}
}

function GetNearestSelection(mousePos)
{
	var precisePoints = currentProject.currentFile.GetPreciseSelectionEntries();

	var minDistance = {
		index: 0,
		distance: Infinity
	};

	for (var i=0; i<precisePoints.length; ++i)
	{
	    var dist = precisePoints[i].Distance(mousePos);

		if (dist < minDistance.distance)
		{
			minDistance.index = i;
			minDistance.distance = dist;
		}
	}

	if (minDistance.index != 0)
	{
		return [precisePoints[minDistance.index].point];
	}

	return currentProject.currentFile.GetAllPointsAt(GetGridPos(mousePos));
}

function ToggleDevArea()
{
	if (rightarea.style.visibility == "hidden")
		rightarea.style.visibility = "visible";
	else
		rightarea.style.visibility = "hidden";
	ResizeCanvas();
}

function CalculateCenter(lines) {
    var min = new Vector2(Infinity, Infinity);
    var max = new Vector2(-Infinity, -Infinity);

    for (var line of lines) {
        min.x = Math.min(min.x, line.start.x);
        min.y = Math.min(min.y, line.start.y);
        max.x = Math.max(max.x, line.end.x);
        max.y = Math.max(max.y, line.end.y);
    }

    var center = new Vector2(
        Math.round((max.x + min.x) * 0.5),
        Math.round((max.y + min.y) * 0.5)
        );

    return center;
}

function MouseLeave()
{
    if (currentState == StateEnum.GRABBING)
    {
        // TODO should place cursor on other side of the canvas... 
        // but doesn't work due to security reasons...
    }
}