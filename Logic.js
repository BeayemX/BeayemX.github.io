"use strict";

var canvas;
var context;
var notificationarea;
var savedfilesdropdown;
var menubar;
var statusbar;
var statusbarentryleft;
var statusbarentryright;
var leftarea;
var rightarea;

var currentState = StateEnum.IDLE;
var previousState = StateEnum.IDLE;

var currentGridPosition = new GridPoint();
var canvasOffset = { x: 0, y: 0 };

var showGrid = true; // TODO RENAME

var advancedHandlesButton;
var ctrlDown;

var keyboardHandler;
var mouseHandler;

var currentProject;

function OnLoad() {
    currentProject = new Project();

    keyboardHandler = new KeyboardHandler();
    mouseHandler = new MouseHandler();

    window.addEventListener("keydown", keyboardHandler.KeyDown, false)
    window.addEventListener("keyup", keyboardHandler.KeyUp, false)
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
    window.addEventListener('resize', ResizeCanvas, false);

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    menubar = document.getElementById("menubar");
    statusbar = document.getElementById("statusbar");
    statusbarentryleft = document.getElementById("statusbarentryleft");
    statusbarentryright = document.getElementById("statusbarentryright");
    leftarea = document.getElementById('leftarea');
    rightarea = document.getElementById('rightarea');
    rightarea.style.visibility = "visible";

    notificationarea = document.getElementById('notificationarea');
    savedfilesdropdown = document.getElementById('savedfilesdropdown');

    advancedHandlesButton = document.getElementById('advancedHandlesButton');
    UpdateAdvancedHandlesButton();

    canvas.addEventListener("mousemove", MouseMove);
    canvas.addEventListener("mouseup", MouseUp);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mousewheel", MouseScroll);
    canvas.addEventListener("mouseleave", MouseLeave);

    notificationarea.addEventListener("mouseenter", NotificationEnter);
    notificationarea.addEventListener("mouseout", NotificationExit);

    savedfilesdropdown.addEventListener("change", DropDownSelected)

    canvas.style.background = canvasColor;
    ResizeCanvas();

    canvasOffset.x = canvas.width * 0.5;
    canvasOffset.y = canvas.height * 0.5;

    LoadURLParameters();

    if (urlParameters)
        if (!urlParameters["file"] || !Open(urlParameters["file"]))
            LoadAutoSave();

    /*
    if (!LoadAutoSave())
        if (!LoadStartupFile())
            GenerateStartUpFile();
    //*/
    UpdateDropdown();
    currentProject.currentFile.UpdateStats();
    Redraw();
    // ForTestingPurposeOnly();
    TestActionHistory();
}

function ForTestingPurposeOnly() {
    Notify("Test Function called!");
}

function ForTestingPurposeOnly2() {
    Notify("Test Function 2 called!");
}

function ResizeCanvas() // TODO rename to LayoutGUI
{
    // leftarea.style.top = window.innerHeight * 0.5 - leftarea.offsetHeight * 0.5;
    // rightarea.style.top = window.innerHeight * 0.5 - rightarea.offsetHeight * 0.5;
    notificationarea.style.top = 0;

    canvas.width = window.innerWidth - leftarea.offsetWidth;
    if (rightarea.style.visibility == "visible")
        canvas.width -= rightarea.offsetWidth;

    canvas.height = window.innerHeight - menubar.offsetHeight - statusbar.offsetHeight;
    canvas.style.left = leftarea.offsetWidth;
    canvas.style.top = menubar.offsetHeight;
    Redraw();
}

function Redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!IsRendering()) {
        DrawGrid();
        if (currentState == StateEnum.BORDERSELECTION)
            DrawHelpers();
        DrawBorderSelection();
    }

    DrawStoredLines();

    if (!IsRendering())
        DrawPreciseSelection();

    if (currentState == StateEnum.IDLE || currentState == StateEnum.DRAWING) {
        DrawPreview();
    }
}

function SetState(state) {
    if (currentState == state)
        return;

    previousState = currentState;
    currentState = state;
    // console.log(previousState  + " --> " + currentState);
}

function IsRendering() {
    return currentState == StateEnum.RENDERPREVIEW; // ||
    //(currentState == StateEnum.PANNING && previousState == StateEnum.RENDERPREVIEW);
}

function WriteToStatusbarLeft(text) {
    statusbarentryleft.innerHTML = text;
}
function WriteToStatusbarRight(text) {
    statusbarentryright.innerHTML = text;
}