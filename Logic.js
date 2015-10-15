var canvas;
var context;
var lines = [];
var state = StateEnum.IDLE;
var currentGridPosition;
var canvasOffset = {x: 0, y: 0};

function OnLoad()
{
	window.addEventListener( "keydown", KeyDown, false )
	window.addEventListener( "keyup", KeyUp, false )
	window.addEventListener("contextmenu", function(e) {e.preventDefault(); return false;} );
    window.addEventListener('resize', ResizeCanvas, false);


	canvas = document.getElementById('canvas');
  	context = canvas.getContext('2d');

  	canvas.addEventListener("mousemove", MouseMove);
  	canvas.addEventListener("mouseup", MouseUp);
  	canvas.addEventListener("mousedown", MouseDown);
  	window.addEventListener("mousewheel", MouseScroll); 

  	canvas.style.background = canvasColor;
  	ResizeCanvas();

  	ForTestingPurposeOnly();
}

function ForTestingPurposeOnly()
{
	console.log("State: " + state);
}

function ResizeCanvas()
{
	canvas.width = window.innerWidth * canvasWidthFactor;
    canvas.height = window.innerHeight * canvasHeightFactor;
    canvas.style.left = window.innerWidth * (1-canvasWidthFactor) * 0.5;
    canvas.style.top = window.innerHeight * (1-canvasHeightFactor) * 0.5;
    Redraw();
}

function Redraw()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	DrawGrid();
	DrawStoredLines();
}

function DrawGrid()
{
	//context.lineWidth = gridPointLineWidth;
	
	var width = canvas.width / gridSize;
	var height = canvas.height / gridSize;

	for (var y=0; y<height+1; ++y)
	{
		for (var x=0; x<width+1; ++x)
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
			DrawCircle(x*gridSize, y*gridSize, gridPointSize);
		}
	}

}

function DrawStoredLines() // RENAME DrawStoredLines or sth...
{
	context.lineWidth = lineWidth;
	
	// context.lineWidth = gridPointLineWidth;
	//context.strokeStyle = "#000";
	//context.fillStyle = "#000";
	
	for (var i=0; i<lines.length; ++i)
	{
		DrawGridLine(lines[i]);
	}
}

function DrawPreview()
{
	DrawHelpers();
	
	context.strokeStyle = previewLineColor;
	context.fillStyle = previewLineColor;
	if (state == StateEnum.DRAWING)
	{
		var start = GetGridPos(downPoint);
		var end = currentGridPosition;//GetGridPos(vec2);
		context.lineWidth = lineWidth;

		DrawGridLine(start, end);
	}

	DrawGridPoint(GridpointToScreenpoint(currentGridPosition));
}

function DrawHelpers()
{
	context.strokeStyle = helperColor;
	context.lineWidth = helperLineWidth;
	var screenpos = GridpointToScreenpoint( currentGridPosition);
	DrawLineFromTo(0, screenpos.y, canvas.width, screenpos.y);
	DrawLineFromTo(screenpos.x, 0, screenpos.x, canvas.height);
}