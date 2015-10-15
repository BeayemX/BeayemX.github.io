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
	if (arguments.length == 1)
	{
		var selectedPoints = line.SelectedPoints();
		if ( selectedPoints == 2)
		{
			context.strokeStyle = selectionColor;
			context.fillStyle = selectionColor;	
		}
		else if ( selectedPoints == 0)
		{
			context.strokeStyle = lineColor;
			context.fillStyle = lineColor;	
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

			gradient.addColorStop(0, selectionColor);
			gradient.addColorStop(1, lineColor);
			
			context.strokeStyle = gradient;
			context.fillStyle = gradient;	
		}
	}

	DrawLineFromTo(startX, startY, endX, endY);
	DrawCircle(startX, startY, gridPointSize);
	DrawCircle(endX, endY, gridPointSize);
}

function DrawGridPoint(screenpos)
{
	var gridPoint = GetGridPos(screenpos);
	DrawCircle(gridPoint.x * gridSize, gridPoint.y * gridSize, gridPointSize);
}