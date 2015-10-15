var oldPos = {x: -1, y: -1};

function MouseMove(e)
{
	var newPos = GetMousePos(e);
	var oldGridPoint = GetGridPos(oldPos);
	currentGridPosition = GetGridPos(newPos);
	var delta = {
		x: currentGridPosition.x - oldGridPoint.x,
		y: currentGridPosition.y - oldGridPoint.y
	}
	if (delta.x != 0 || delta.y != 0)
		GridPositionChanged(e, delta);

	oldPos = newPos;
}

function GridPositionChanged(e, delta)
{
	if (state == StateEnum.GRABBING)
	{
		var points = GetAllSelectedPoints();
		MovePointsBy(points, delta);
	}

	Redraw();
	
	if (state == StateEnum.IDLE || state == StateEnum.DRAWING)
	{
		DrawPreview(e);
	}
}

var downPoint; // TODO rename downPointScreenpos
function MouseDown(e)
{
	var point = GetMousePos(e);

	if (e.button == 0) // LMB
	{
		if (state == StateEnum.IDLE)
		{
			state = StateEnum.DRAWING;
			downPoint = {x: point.x, y: point.y};
			GridPositionChanged();
		}
		else if (state == StateEnum.GRABBING)
		{
			CheckForCrapLines();
			state = StateEnum.IDLE;
		}
	}
	else if (e.button == 2) // RMB
	{
		if (state == StateEnum.IDLE)
		{
			if (!e.shiftKey)
				ClearSelection();
			points = GetAllPointsAt(GetGridPos(point));
			ChangeSelectionForPoints(points);
		}
		else if (state == StateEnum.GRABBING) // cancel grab
		{
			state = StateEnum.IDLE;
			var resetDelta = {
				x: grabStartPosition.x - currentGridPosition.x,
				y: grabStartPosition.y - currentGridPosition.y
			};
			var points = GetAllSelectedPoints();
			MovePointsBy(points, resetDelta);
		}
		Redraw();
	}
	else if (e.button == 1) // MMB
	{
		var screenPos = GetMousePos(e);
		state = StateEnum.PANNING;
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

function MouseUp(e)
{
	if (e.button == 0) // LMB
	{
		if (state == StateEnum.DRAWING)
		{
			var point = GetMousePos(e);
			gridLineStart = GetGridPos(downPoint);
			gridLineEnd = GetGridPos(point);
			if (gridLineStart.x != gridLineEnd.x || gridLineStart.y != gridLineEnd.y)
				lines.push(
					new Line(
						gridLineStart.x, 
						gridLineStart.y, 
						gridLineEnd.x,
						gridLineEnd.y
						));
			downPoint = undefined;
			state = StateEnum.IDLE;
			GridPositionChanged();
		}
	}
}

function MouseScroll(e)
{
	console.log("scroll: " + e.deltaY);
	if (e.deltaY < 0) // upscroll
		gridSize += 2;
	else
		gridSize -= 2;
	Redraw();
}