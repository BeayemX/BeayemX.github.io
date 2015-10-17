var canvas;
var context;
var notificationarea;
var savedfilesdropdown;

var lines = [];
var currentState = StateEnum.IDLE;
var previousState = StateEnum.IDLE;

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
  savedfilesdropdown = document.getElementById('savedfilesdropdown');

  canvas.addEventListener("mousemove", MouseMove);
  canvas.addEventListener("mouseup", MouseUp);
  canvas.addEventListener("mousedown", MouseDown);
  canvas.addEventListener("mousewheel", MouseScroll); 

  notificationarea.addEventListener("mouseenter", NotificationEnter);
  notificationarea.addEventListener("mouseout", NotificationExit);

  savedfilesdropdown.addEventListener("change", DropDownSelected)

  canvas.style.background = canvasColor;
  ResizeCanvas();

  canvasOffset.x = canvas.width * 0.5;
  canvasOffset.y = canvas.height * 0.5;

  LoadStartupFile();
  UpdateDropdown();

  Redraw();
	// ForTestingPurposeOnly();
}

function ForTestingPurposeOnly()
{
	Notify("State: asdf asfasf joiehf andfub kjsdf ui4 3ub alks<br><br>asdf:<br> asökfd asödfj ajsöfd<br>jdf 3b4k lasbf 2");
}

function ResizeCanvas() // TODO rename to LayoutGUI
{
  toolarea.style.top = window.innerHeight * 0.5 - toolarea.offsetHeight * 0.5;
  notificationarea.style.top = 0;

  canvas.width = window.innerWidth - toolarea.offsetWidth;
  canvas.height = window.innerHeight
  canvas.style.left = toolarea.offsetWidth;
  canvas.style.top = 0;
  Redraw();
}

function Redraw()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if (!IsRendering())
  {
		DrawGrid();
    DrawHelpers();
  }
	
	DrawStoredLines();
}

function SetState(state)
{
  if (currentState == state)
    return;
  
  previousState = currentState;
  currentState = state;
}

function IsRendering()
{
  return currentState == StateEnum.RENDERPREVIEW ||
  (currentState == StateEnum.PANNING && previousState == StateEnum.RENDERPREVIEW);
}