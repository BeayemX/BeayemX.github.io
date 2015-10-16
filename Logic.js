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
  notificationarea = document.getElementById('notificationarea');

  canvas.addEventListener("mousemove", MouseMove);
  canvas.addEventListener("mouseup", MouseUp);
  canvas.addEventListener("mousedown", MouseDown);
  canvas.addEventListener("mousewheel", MouseScroll); 

  notificationarea.addEventListener("mouseenter", NotificationEnter);
  notificationarea.addEventListener("mouseout", NotificationExit);

  canvas.style.background = canvasColor;
  ResizeCanvas();

  canvasOffset.x = canvas.width * 0.5;
  canvasOffset.y = canvas.height * 0.5;

  LoadAutoSave();

  Redraw();
	// ForTestingPurposeOnly();
}

function ForTestingPurposeOnly()
{
	Notify("State: asdf asfasf joiehf andfub kjsdf ui4 3ub alks<br><br>asdf:<br> asökfd asödfj ajsöfd<br>jdf 3b4k lasbf 2");
}

function ResizeCanvas() // TODO rename to LayoutGUI
{
  toolarea.style.width = toolareaWidth;
  toolarea.style.left = 0;
  toolarea.style.top = window.innerHeight * 0.5 - toolarea.offsetHeight * 0.5;

  notificationarea.style.top = 0;

  canvas.width = window.innerWidth - toolareaWidth;
  canvas.height = window.innerHeight
  canvas.style.left = toolareaWidth;
  canvas.style.top = 0;
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