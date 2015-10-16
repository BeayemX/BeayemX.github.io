var canvas;
var context;
var lines = [];
var state = StateEnum.IDLE;
var currentGridPosition = {x: 0, y: 0};
var canvasOffset = {x: 0, y: 0};

function OnLoad()
{
	window.addEventListener( "keydown", KeyDown, false )
	window.addEventListener( "keyup", KeyUp, false )
	window.addEventListener("contextmenu", function(e) {e.preventDefault(); return false;} );
  window.addEventListener('resize', ResizeCanvas, false);


	canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  toolarea = document.getElementById('toolarea');

  canvas.addEventListener("mousemove", MouseMove);
  canvas.addEventListener("mouseup", MouseUp);
  canvas.addEventListener("mousedown", MouseDown);
  window.addEventListener("mousewheel", MouseScroll); 

  canvas.style.background = canvasColor;
  ResizeCanvas();

  canvasOffset.x = canvas.width * 0.5;
  canvasOffset.y = canvas.height * 0.5;

  LoadAutoSave();

  Redraw();
	ForTestingPurposeOnly();
}

function ForTestingPurposeOnly()
{
	console.log("State: " + state);
}

function ResizeCanvas()
{
  toolarea.style.width = toolareaWidth;
  toolarea.style.left= 0;
  toolarea.style.top = window.innerHeight * 0.5 - toolarea.offsetHeight * 0.5;

  canvas.width = window.innerWidth * canvasWidthFactor - toolareaWidth;
  canvas.height = window.innerHeight * canvasHeightFactor;
  canvas.style.left = window.innerWidth * (1-canvasWidthFactor) * 0.5 + toolareaWidth;
  canvas.style.top = window.innerHeight * (1-canvasHeightFactor) * 0.5;
  Redraw();
}

function Redraw()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if (state != StateEnum.RENDERPREVIEW)
  {
		DrawGrid();
    DrawHelpers();
  }
	
	DrawStoredLines();
}