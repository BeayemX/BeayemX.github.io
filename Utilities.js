function GetMousePos(e) 
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
	};
}

function GetMousePosConsideringOffset(e) 
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: e.clientX - rect.left - canvasOffset.x,
		y: e.clientY - rect.top - canvasOffset.y
	};
}

function GridpointToScreenpoint(gridpoint)
{
	return {
		x: gridpoint.x * gridSize + canvasOffset.x,
		y: gridpoint.y * gridSize + canvasOffset.y
	};
}


function GetGridPos(screenPos) // TODO rename to ScreenpointToGridpoint
{
	return new GridPoint(
		Math.round((screenPos.x - canvasOffset.x) / gridSize),	
		Math.round((screenPos.y - canvasOffset.y) / gridSize)
	);
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

function GetAllPointsAt(gridpoint)
{
	var points = [];
	for (var i=0; i<lines.length; ++i)
	{
		if (lines[i].start.x == gridpoint.x && lines[i].start.y == gridpoint.y)
			points.push(lines[i].start);
		else if (lines[i].end.x == gridpoint.x && lines[i].end.y == gridpoint.y)
			points.push(lines[i].end);
	}
	return points;
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

function GetAllSelectedPoints()
{
	var points = [];
	
	for (var i=0; i<lines.length; ++i)
	{
		if (lines[i].start.selected)
			points.push(lines[i].start);
		if (lines[i].end.selected)
			points.push(lines[i].end);
	}

	return points;
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
            var start = { x: grabStartPosition.x, y: grabStartPosition.y };
            actionhistory.PushAction(new MoveAction(points, curr, start));
        }
    }
}

function SelectAllToggle()
{
	var points = GetAllSelectedPoints();

	if (points.length == 0)
		SelectAllPoints();
	else
		ClearSelection();
	Redraw();
}

function GetAllPoints()
{
	var points = [];
	for (var i=0; i<lines.length; ++i)
	{
		points.push(lines[i].start);
		points.push(lines[i].end);
	}
	return points;
}
function SelectAllPoints()
{
	var allPoints = GetAllPoints();
	SelectPoints(allPoints);
}

function ClearSelection()
{
    SelectPoints(GetAllSelectedPoints(), false);
    CheckForCrapLines();
}

function DeleteSelectedLines()
{
	var points = GetAllSelectedPoints();
	for (var i=points.length-1; i>=0; --i)
	{
		for (var j=lines.length-1; j>=0; --j)
		{
			if (lines[j].start == points[i]
				|| lines[j].end == points[i])
				DeleteArrayEntry(lines, lines[j]);
		}
	}
	Redraw();
}

function CheckForCrapLines()
{
	// lines with length 0
	for (var i=0; i<lines.length; ++i)
	{
		if (	lines[i].start.x == lines[i].end.x
			&&  lines[i].start.y == lines[i].end.y)
				DeleteArrayEntry(lines, lines[i]);
	}

    // overlapping lines
	var deletedLinesCounter = 0;
	for (var i=lines.length-1; i>=0; --i)
	{
	    for (var j = lines.length-1; j > i; --j)
	    {
	        if (lines[i].SelectedPoints == 0 &&
                LinesOverlapping(lines[i], lines[j]))
	        {
			    DeleteArrayEntry(lines, lines[j]);
			    ++deletedLinesCounter;
			    continue;
			}
		}
	}
	var text = lines.length + " lines";

	if (deletedLinesCounter > 0)
	{
	    Redraw();
	    text += " (" + deletedLinesCounter + " cleaned up)";
	}

	WriteToStatusbarRight(text);
}

function InvertSelection()
{
	var points = GetAllPoints();
	for (var i=0; i<points.length; ++i)
	{
		points[i].selected = !points[i].selected;
	}
	Redraw();
}

function DuplicateLines()
{
	var selectedLines = GetSelectedLines();

	for (var i=0; i<selectedLines.length; ++i)
	{
		lines.push(new Line(
			selectedLines[i].start.x,
			selectedLines[i].start.y,
			selectedLines[i].end.x,
			selectedLines[i].end.y
			))
	}
	CheckForCrapLines();
}

function GetSelectedLines()
{
	var points = GetAllSelectedPoints();
	var selectedLines = [];
	for (var i=0; i<lines.length; ++i)
	{
		if (lines[i].start.selected || lines[i].end.selected)
			selectedLines.push(lines[i]);
	}
	return selectedLines;
}

function GetUnselectedLines()
{
    var points = GetAllSelectedPoints();
    var selectedLines = [];
    for (var i = 0; i < lines.length; ++i) {
        if (lines[i].start.selected == false && lines[i].end.selected == false)
            selectedLines.push(lines[i]);
    }
    return selectedLines;
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
	var points = GetAllPoints();

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

function GetOtherPointBelongingToLine(point)
{
	for (var i=0; i<lines.length; ++i)
	{
		if (lines[i].start === point)
			return lines[i].end;

		else if (lines[i].end === point)
			return lines[i].start;
	}
}
function Distance(v1, v2)
{
	var vec2 = {
		x: v2.x - v1.x,
		y: v2.y - v1.y
	}
	return Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
}

function Normalize(vec2)
{
	var magnitude = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

	vec2.x /= magnitude;
	vec2.y /= magnitude;
}

function GetNearestSelection(mousePos)
{
	var precisePoints = GetPreciseSelectionEntries();

	var minDistance = {
		index: 0,
		distance: Infinity
	};

	for (var i=0; i<precisePoints.length; ++i)
	{
		var dist = Distance(precisePoints[i], mousePos);

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

	return GetAllPointsAt(GetGridPos(mousePos));
}

function GetPreciseSelectionEntries()
{
	var points = GetAllPointsAt(currentGridPosition);
	var screenPos = GridpointToScreenpoint(currentGridPosition);
	var precisePoints = [screenPos];

	if (points.length <= 1 || !showAdvancedHandles)
		return precisePoints

	for (var i=0; i<points.length; ++i)
	{
		var otherPoint = GetOtherPointBelongingToLine(points[i]);
		var direction = {
			x: otherPoint.x - points[i].x,
			y: otherPoint.y - points[i].y};

		Normalize(direction);

		var preciseRadius = gridSize * 0.5 - gridPointSize * 2;
		var precisePoint = {
			x: screenPos.x + direction.x * preciseRadius, 
			y: screenPos.y + direction.y * preciseRadius,
			selected: points[i].selected,
			point: points[i]
		};

		precisePoints.push(precisePoint);
	}
	return precisePoints;
}
function ToggleDevArea()
{
	if (rightarea.style.visibility == "hidden")
		rightarea.style.visibility = "visible";
	else
		rightarea.style.visibility = "hidden";
	ResizeCanvas();
}

function LinesOverlapping(line1, line2)
{
    return (line1.start.x == line2.start.x
    && line1.start.y == line2.start.y
	&& line1.end.x == line2.end.x
	&& line1.end.y == line2.end.y )
	||
    (  line1.start.x == line2.end.x
    && line1.start.y == line2.end.y
    && line1.end.x == line2.start.x
    && line1.end.y == line2.start.y);
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

function SelectionPresent()
{
    for (var line of lines) {
        if (line.start.selected || line.end.selected)
            return true;
    }
    return false;
}

function MouseLeave()
{
    if (currentState == StateEnum.GRABBING)
    {
        // TODO should place cursor on other side of the canvas... 
        // but doesn't work due to security reasons...
    }
}