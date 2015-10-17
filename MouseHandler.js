var oldPos = {x: -1, y: -1};

function MouseMove(e)
{
	var newPos = GetMousePos(e);
	if (currentState != StateEnum.PANNING)
	{
		var oldGridPoint = GetGridPos(oldPos);
		currentGridPosition = GetGridPos(newPos);
		var gridPosDelta = {
			x: currentGridPosition.x - oldGridPoint.x,
			y: currentGridPosition.y - oldGridPoint.y
		}
		if (gridPosDelta.x != 0 || gridPosDelta.y != 0)
			GridPositionChanged(e, gridPosDelta);
	}
	else // while panning
	{
		var screenPosDelta = {
			x: newPos.x - oldPos.x,
			y: newPos.y - oldPos.y
		}

		canvasOffset.x += screenPosDelta.x;
		canvasOffset.y += screenPosDelta.y;
		Redraw();
	}

	oldPos = newPos;
}

function GridPositionChanged(e, delta)
{
	if (currentState == StateEnum.GRABBING)
	{
		var points = GetAllSelectedPoints();
		MovePointsBy(points, delta);
	}

	Redraw();
	
	if (currentState == StateEnum.IDLE || currentState == StateEnum.DRAWING)
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
		if (currentState == StateEnum.IDLE)
		{
			SetState(StateEnum.DRAWING);
			downPoint = {x: point.x, y: point.y};
			GridPositionChanged();
		}
		else if (currentState == StateEnum.GRABBING)
		{
			CheckForCrapLines();
			SetState(StateEnum.IDLE);
		}
	}
	else if (e.button == 2) // RMB
	{
		if (currentState == StateEnum.IDLE)
		{
			if (!e.shiftKey)
				ClearSelection();
			points = GetAllPointsAt(GetGridPos(point));
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
		Redraw();
	}
	else if (e.button == 1) // MMB
	{
		var screenPos = GetMousePos(e);
		SetState(StateEnum.PANNING);
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
		if (currentState == StateEnum.DRAWING)
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
			SetState(StateEnum.IDLE);
			GridPositionChanged();
		}
	}

	else if (e.button == 1) // MMB
	{
		var screenPos = GetMousePos(e);
		SetState(previousState);
	}
}

function MouseScroll(e)
{
	if (e.deltaY < 0) // upscroll
		Zoom(1.1);
	else
		Zoom(0.9);

	MouseMove(e);
	Redraw();
}

function Zoom(delta)
{
	gridSize *= delta;
}