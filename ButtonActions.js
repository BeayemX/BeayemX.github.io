var showHandles = true;
var showAdvancedHandles = false;


function Button1()
{
	console.log("button pressed");
}

function Subdivide()
{
	var selectedLines = currentProject.currentFile.GetSelectedLines();
	for (var i=0; i<selectedLines.length; ++i)
	{
		var midPoint = 
		{
			x: Math.round((selectedLines[i].end.x + selectedLines[i].start.x) / 2),
			y: Math.round((selectedLines[i].end.y + selectedLines[i].start.y) / 2)
		}
	    currentProject.currentFile.AddLine(new Line(selectedLines[i].start.x, selectedLines[i].start.y, midPoint.x, midPoint.y, true));
	    currentProject.currentFile.AddLine(new Line(midPoint.x, midPoint.y, selectedLines[i].end.x, selectedLines[i].end.y, true));
	    currentProject.currentFile.RemoveLine(selectedLines[i]);
	}
	Redraw();
}

function Mirror()
{
    var minX = Infinity;
    var maxX = -Infinity;
    var selLines = currentProject.currentFile.GetSelectedLines();

	for (var i=0; i<selLines.length; ++i)
	{
		minX = Math.min(minX, selLines[i].start.x);
		maxX = Math.max(maxX, selLines[i].start.x);

		minX = Math.min(minX, selLines[i].end.x);
		maxX = Math.max(maxX, selLines[i].end.x);
	}
	
	for (var i=0; i<selLines.length; ++i)
	{
		selLines[i].start.x -= (selLines[i].start.x - minX) * 2 - (maxX-minX);
		selLines[i].end.x -= (selLines[i].end.x - minX) * 2 - (maxX-minX);
	}
	Redraw();
}

function Rotate(clockwise)
{
	var minX = Infinity;
	var minY = Infinity;
	var selLines = currentProject.currentFile.GetSelectedLines();

	for (var i=0; i<selLines.length; ++i)
	{
		minX = Math.min(minX, selLines[i].start.x);
		minY = Math.min(minY, selLines[i].start.y);

		minX = Math.min(minX, selLines[i].end.x);
		minY = Math.min(minY, selLines[i].end.y);
	}
	
	for (var i=0; i<selLines.length; ++i)
	{
		var tmp = selLines[i].start.x;
		selLines[i].start.x = selLines[i].start.y;
		selLines[i].start.y = tmp;

		if (clockwise)
			selLines[i].start.x = -selLines[i].start.x
		else
			selLines[i].start.y = -selLines[i].start.y

		tmp = selLines[i].end.x;
		selLines[i].end.x = selLines[i].end.y;
		selLines[i].end.y = tmp;

		if (clockwise)
			selLines[i].end.x = -selLines[i].end.x
		else
			selLines[i].end.y = -selLines[i].end.y
	}

	var newMinX = Infinity;
	var newMinY = Infinity;

	for (var i=0; i<selLines.length; ++i)
	{
		newMinX = Math.min(newMinX, selLines[i].start.x);
		newMinY = Math.min(newMinY, selLines[i].start.y);

		newMinX = Math.min(newMinX, selLines[i].end.x);
		newMinY = Math.min(newMinY, selLines[i].end.y);
	}
	
	for (var i=0; i<selLines.length; ++i)
	{
		selLines[i].start.x += minX - newMinX;
		selLines[i].start.y += minY - newMinY;
		selLines[i].end.x += minX - newMinX;
		selLines[i].end.y += minY - newMinY;
	}
	Redraw();
}
function ToggleGridType()
{
	showGrid = !showGrid;
	Redraw();
}

function ToggleHandles(button)
{
    showHandles = !showHandles;   

    if (showHandles)
        button.innerHTML = "Hide line handles";
    else
        button.innerHTML = "Show line handles";

    Redraw();
}

var advancedHandlesState = false;

function ToggleAdvancedHandles()
{
    advancedHandlesState = !advancedHandlesState;
    showAdvancedHandles = advancedHandlesState;

    UpdateAdvancedHandlesButton();

    Redraw();
}

function UpdateAdvancedHandlesButton()
{
    if (showAdvancedHandles)
        advancedHandlesButton.innerHTML = "Advanced handles: ON";
    else
        advancedHandlesButton.innerHTML = "Advanced handles: OFF";
}

function IncreaseSize(factor)
{
    var selLines = currentProject.currentFile.GetSelectedLines();
    var center = CalculateCenter(selLines);

    var correctlyScalable = true;

    for (var line of selLines)
    {
        if (
            line.start.x * factor % 1 != 0 ||
            line.start.y * factor % 1 != 0 ||
            line.end.x * factor % 1 != 0 ||
            line.end.y * factor % 1 != 0)
        {
            correctlyScalable = false;
            break;
        }
    }

    if (correctlyScalable || confirm("Cant scale correctly. Do you really want to proceed?")) {
        for (var line of selLines)
        {
            line.start.x = Math.round(line.start.x * factor);
            line.start.y = Math.round(line.start.y * factor);
            line.end.x = Math.round(line.end.x * factor);
            line.end.y = Math.round(line.end.y * factor);
        }

        var newCenter = CalculateCenter(selLines);
        var delta = new Vector2(center.x - newCenter.x,
            center.y - newCenter.y);

        var points = currentProject.currentFile.GetAllSelectedPoints();
        MovePointsBy(points, delta)
        currentProject.currentFile.CleanUpFile();
        Redraw();
    }
}

function GrowSelection() {
    currentProject.currentFile.GrowSelection(true);
}
function SelectLinked() {
    currentProject.currentFile.SelectLinked();
}

SelectLinked