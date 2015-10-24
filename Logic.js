"use strict";

var canvas;
var context;
var notificationarea;
var savedfilesdropdown;
var leftarea;
var rightarea;

var lines = [];
var currentState = StateEnum.IDLE;
var previousState = StateEnum.IDLE;

var currentGridPosition = {x: 0, y: 0};
var canvasOffset = {x: 0, y: 0};

var showGrid = true; // TODO RENAME

function OnLoad()
{
	window.addEventListener( "keydown", KeyDown, false )
	window.addEventListener( "keyup", KeyUp, false )
	window.addEventListener("contextmenu", function(e) {e.preventDefault(); return false;} );
    window.addEventListener('resize', ResizeCanvas, false);

	canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    leftarea = document.getElementById('leftarea');
    rightarea = document.getElementById('rightarea');
    rightarea.style.visibility = "visible";

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

    LoadAutoSave();

    /*
    if (!LoadAutoSave())
        if (!LoadStartupFile())
            GenerateStartUpFile();
    //*/
    UpdateDropdown();

    Redraw();
	// ForTestingPurposeOnly();
}

function ForTestingPurposeOnly()
{
    Notify("Test Function called!");
    var v = new Vector2(0, 0);
    v.x = 5;
    console.log(v.x);
    console.log(v.y);
}

function ResizeCanvas() // TODO rename to LayoutGUI
{
  // leftarea.style.top = window.innerHeight * 0.5 - leftarea.offsetHeight * 0.5;
  // rightarea.style.top = window.innerHeight * 0.5 - rightarea.offsetHeight * 0.5;
  notificationarea.style.top = 0;

  canvas.width = window.innerWidth - leftarea.offsetWidth;
  if (rightarea.style.visibility == "visible")
    canvas.width -= rightarea.offsetWidth;

  canvas.height = window.innerHeight
  canvas.style.left = leftarea.offsetWidth;
  canvas.style.top = 0;
  Redraw();
}

function Redraw()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if (!IsRendering())
  {
		DrawGrid();
    if (currentState == StateEnum.BORDERSELECTION)
      DrawHelpers();
    DrawBorderSelection();
  }
	
	DrawStoredLines();
  
  if (!IsRendering())
    DrawPreciseSelection();
}

function SetState(state)
{
  if (currentState == state)
    return;
  
  previousState = currentState;
  currentState = state;
  // console.log(previousState  + " --> " + currentState);
}

function IsRendering()
{
  return currentState == StateEnum.RENDERPREVIEW; // ||
  //(currentState == StateEnum.PANNING && previousState == StateEnum.RENDERPREVIEW);
}