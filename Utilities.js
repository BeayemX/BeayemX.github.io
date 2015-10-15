function GetMousePos(e) 
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
	};
}

function GridpointToScreenpoint(gridpoint)
{
	return {
		x: gridpoint.x * gridSize,
		y: gridpoint.y * gridSize
	};
}


function GetGridPos(screenPos) // TODO rename to ScreenpointToGridpoint
{
	return new GridPoint(
		Math.round(screenPos.x / gridSize),	
		Math.round(screenPos.y / gridSize)
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

function MovePointsBy(points, delta)
{
	for (var i=0; i<points.length; ++i)
	{
		points[i].x += delta.x;
		points[i].y += delta.y;
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
	for (var i=0; i<lines.length; ++i)
	{
		for (var j=0; j<lines.length; ++j)

		{
			if (i!=j &&
				(  lines[i].start.x == lines[j].start.x
				&& lines[i].start.y == lines[j].start.y
				&& lines[i].end.x == lines[j].end.x
				&& lines[i].end.y == lines[j].end.y )
				||
				(  lines[i].start.x == lines[j].end.x
				&& lines[i].start.y == lines[j].end.y
				&& lines[i].end.x == lines[j].start.x
				&& lines[i].end.y == lines[j].start.y )
				)
			{
				DeleteArrayEntry(lines, lines[j]);
				continue;
			}
		}
	}	
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