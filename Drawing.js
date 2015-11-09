"use strict"
function DrawLineFromTo(x1, y1, x2, y2)
{
	context.beginPath();
	if (arguments.length == 2)
	{
		context.moveTo(x1.x, x1.y);
		context.lineTo(y1.x, y1.y);
	}
	else if (arguments.length == 4)
	{
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
	}
	context.stroke();
}


function DrawCircle(centerX, centerY, radius)
{
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2*Math.PI);
	context.stroke();
	context.fill();
}

function DrawGridLine(line, endpoint)
{
	var startX;
	var startY;
	var endX;
	var endY;

	if (arguments.length == 1)
	{
		startX = line.start.x * gridSize;
		startY = line.start.y * gridSize;
		endX = line.end.x * gridSize;
		endY = line.end.y * gridSize;
	}
	else if (arguments.length == 2)
	{
		startX = line.x * gridSize;
		startY = line.y * gridSize;
		endX = endpoint.x * gridSize;
		endY = endpoint.y * gridSize;
	}

	startX += canvasOffset.x;
	startY += canvasOffset.y;
	endX += canvasOffset.x;
	endY += canvasOffset.y;

	if (arguments.length == 1)
	{
		var selectedPoints = line.SelectedPoints;
		if ( selectedPoints == 0 || IsRendering())
		{
			context.strokeStyle = lineColor;
			context.fillStyle = lineColorFill;
		}
		else if ( selectedPoints == 2)
		{
			context.strokeStyle = selectionColor;
			context.fillStyle = selectionColorFill;	
		}
		else
		{
			var gradientStart;
			var gradientEnd;
			if (line.start.selected)
			{
				gradientStart = line.start;
				gradientEnd = line.end;
			}
			else 
			{
				gradientStart = line.end;
				gradientEnd = line.start;
			}
			var gradient = context.createLinearGradient(
				GridpointToScreenpoint(gradientStart).x, 
				GridpointToScreenpoint(gradientStart).y, 
				GridpointToScreenpoint(gradientEnd).x, 
				GridpointToScreenpoint(gradientEnd).y);

			gradient.addColorStop(0, selectionColorFill);
			gradient.addColorStop(1, lineColorFill);
			
			context.strokeStyle = gradient;
			context.fillStyle = gradient;	
		}
	}

	DrawLineFromTo(startX, startY, endX, endY);

	if (!IsRendering() && showHandles)
	{
		DrawCircle(startX, startY, lineEndingRadius);
		DrawCircle(endX, endY, lineEndingRadius);
	}
}

function DrawGridPoint(screenpos)
{
	var gridPoint = GetGridPos(screenpos);
	DrawCircle(gridPoint.x * gridSize + canvasOffset.x, gridPoint.y * gridSize + canvasOffset.y, gridPointSize);
}


function DrawGrid()
{	
	if (!showGrid)
	{
		// TODO remove?
		var width = canvas.width / gridSize;
		var height = canvas.height / gridSize;

		width = gridCellNumber;
		height = gridCellNumber;
		for (var y=-height * 0.5; y<height * 0.5+1; ++y)
		{
			for (var x=-width * 0.5; x<width * 0.5 + 1; ++x)
			{
				if (x % bigGridSize == 0 || y % bigGridSize == 0)
				{
					context.lineWidth = bigGridPointLineWidth;
					context.strokeStyle = bigGridPointLineColor;
					context.fillStyle = bigGridPointFillColor;
				}
				else
				{
					context.lineWidth = gridPointLineWidth;
					context.strokeStyle = gridPointLineColor;
					context.fillStyle = gridPointFillColor;
				}
				// TODO why don't i use DrawGridPoint? at the begin of this method '/ gridSize'. here '*gridSize'...
				DrawCircle(x*gridSize + canvasOffset.x, y*gridSize + canvasOffset.y, gridPointSize);
			}
		} 
	} 
	else 
	{	
		var size = gridCellNumber * 0.5;

		for (var i=-size; i<=size; ++i)
		{
			if (i % bigGridSize == 0)
			{
				context.lineWidth = 2;
				context.strokeStyle = gridBigLineColor;

			}
			else if (Math.round(i % (bigGridSize * 0.5) == 0))
			{
				context.lineWidth = 2;
				context.strokeStyle = gridLineColor;	
			}
			else 
			{
				context.lineWidth = 1;
				context.strokeStyle = gridLineColor;

			}

			DrawLineFromTo(
				-size	 * gridSize + canvasOffset.x,
				i* gridSize + canvasOffset.y,
				size 	 * gridSize + canvasOffset.x,
				i * gridSize + canvasOffset.y
			);
			DrawLineFromTo(
				i * gridSize + canvasOffset.x,
				-size 	 * gridSize + canvasOffset.y,
				i * gridSize + canvasOffset.x,
				size 	 * gridSize + canvasOffset.y
			);
		}
	}

	context.lineWidth = 2;
	context.strokeStyle = 'darkred';

	DrawLineFromTo(0, canvasOffset.y, canvas.width, canvasOffset.y);
	DrawLineFromTo(canvasOffset.x, 0, canvasOffset.x, canvas.height);
}

function DrawStoredLines() // RENAME DrawStoredLines or sth...
{
	context.lineWidth = lineWidth;
	
	// context.lineWidth = gridPointLineWidth;
	//context.strokeStyle = "#000";
    //context.fillStyle = "#000";

	var unselLines = GetUnselectedLines();
	var selLines = GetSelectedLines();
    for (var line of unselLines)
	    DrawGridLine(line);
    for (var line of selLines)
		DrawGridLine(line);
}

function DrawPreview()
{
	//DrawHelpers();
	
	context.strokeStyle = previewLineColor;
	context.fillStyle = previewLineColor;
	if (currentState == StateEnum.DRAWING)
	{
		var start = GetGridPos(mouseHandler.downPoint);
		var end = currentGridPosition;//GetGridPos(vec2);
		context.lineWidth = lineWidth;

		DrawGridLine(start, end);
	}

	DrawGridPoint(GridpointToScreenpoint(currentGridPosition));
}

function DrawHelpers()
{
	context.lineWidth = helperLineWidth;
	context.strokeStyle = helperColor;

	var screenpos = GridpointToScreenpoint(currentGridPosition);
	DrawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
	DrawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
}

function DrawBorderSelection()
{
	if (currentState != StateEnum.BORDERSELECTION || !borderSelectionStart || !borderSelectionEnd)
		return;

	context.strokeStyle = selectionColor;
	context.fillStyle = borderSelectionColor;

	var leftTop = GridpointToScreenpoint(borderSelectionStart);
	var size = {
		x: (borderSelectionEnd.x - borderSelectionStart.x) * gridSize,
		y: (borderSelectionEnd.y - borderSelectionStart.y) * gridSize
	};

	context.rect(leftTop.x, leftTop.y, size.x, size.y);
	context.fillRect(leftTop.x, leftTop.y, size.x, size.y);
	context.stroke();
}

function DrawPreciseSelection()
{
	var points = GetPreciseSelectionEntries();
	context.lineWidth = preciseSelectionLineWidth;
	for (var i=0; i<points.length; ++i)
	{
		context.fillStyle = (points[i].selected) ? preciseSelectionSelectionColor : preciseSelectionNoSelectionColor;
		context.strokeStyle = (points[i].selected) ? selectionColor : lineColor;

		DrawCircle(points[i].x, points[i].y, gridPointSize);
	}
}