var canvas;
var context;
var offscreenCanvas;
var offscreenContext;

var currentPosition = new Vector2(0, 0);
let selectionCursor = new Vector2(0, 0);

var drawPolyLine;
var grabInitializedWithKeyboard = false;

let cursorRange = 9;
let currentLineThickness = 1;
let currentLineColor = Color.black();

let SAVER;
let FILE;
let CAMERA;
let DRAW_MANAGER;
let KEYBOARD_HANDLER;
let MOUSE_HANDLER;
let LOGIC;
let GUI;
let UTILITIES;
let EXPORTER;
let ACTION_HISTORY;
let LINE_MANIPULATOR;
let SETTINGS;
let SELECTION;

let GRID;
let snapToGrid = true;
let tmpSwitchSnapToGrid = false;

let showGrid = true;

let spaceDown = false;
let cutLines = false;
let tmpCutLines = false;
let waitingForStart = [];

function onLoad() {
    KEYBOARD_HANDLER = new KeyboardHandler();
    MOUSE_HANDLER = new MouseHandler();
    LOGIC = new Logic();
    SAVER = new Saver();
    FILE = new File();
    CAMERA = new Camera();
    DRAW_MANAGER = new DrawManager();
    GUI = new Gui();
    UTILITIES = new Utilities();
    EXPORTER = new Exporter();
    ACTION_HISTORY = new ActionHistory();
    LINE_MANIPULATOR = new LineManipulator();
    SETTINGS = new Settings();
    SELECTION = new Selection();
    //*/
    GRID = new Grid();
    /*/
    GRID = new TriangleGrid();
    // */

    LOGIC.start();
}

class Logic {
    constructor() {
        console.log("Logic created.");

        this.currentState = StateEnum.IDLE;
        this.previousState = StateEnum.IDLE;
    }

    start() {
        window.addEventListener("keydown", evt => KEYBOARD_HANDLER.KeyDown(evt), false);
        window.addEventListener("keyup", evt => KEYBOARD_HANDLER.KeyUp(evt), false);
        window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
        window.addEventListener('resize', this.layoutGUI, false);
        window.addEventListener('focus', function () {
            tmpCutLines = false;
            GUI.notify("received focus");
        }, false);
        window.onbeforeunload = function () {
            SAVER.autoSave();
        };

        window.onerror = function () {
            GUI.notify("<font color='red'>An error occured! Press F12 to see what went wrong.</font>");
        };

        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        offscreenCanvas = document.getElementById('offscreenCanvas');
        offscreenContext = offscreenCanvas.getContext('2d');

        canvas.addEventListener("mousemove", evt => MOUSE_HANDLER.MouseMove(evt));
        canvas.addEventListener("mouseup", evt => MOUSE_HANDLER.MouseUp(evt));
        canvas.addEventListener("mousedown", evt => MOUSE_HANDLER.MouseDown(evt));
        canvas.addEventListener("mousewheel", evt => MOUSE_HANDLER.MouseScroll(evt));
        canvas.addEventListener("mouseleave", evt => MOUSE_HANDLER.MouseLeave(evt));

        // Setup the dnd listeners.
        let dropZone = document.body;
        dropZone.addEventListener('dragover', SAVER.handleDragOver, false);
        dropZone.addEventListener('drop', SAVER.handleFileSelect, false);

        canvas.style.background = SETTINGS.canvasColor;
        this.layoutGUI();

        CAMERA.canvasOffset.x = canvas.width * 0.5;
        CAMERA.canvasOffset.y = canvas.height * 0.5;

        //SAVER.loadAutoSave();
        SAVER.newFile();

        FILE.updateStats();
        DRAW_MANAGER.redraw();

        for (var i = 0; i < waitingForStart.length; i++) {
            waitingForStart[i].start();
        }
    }

    layoutGUI() {
        canvas.width = window.innerWidth - leftarea.offsetWidth - rightarea.offsetWidth;
        canvas.height = window.innerHeight - GUI.menubar.offsetHeight - GUI.statusbar.offsetHeight;
        canvas.style.left = leftarea.offsetWidth;
        canvas.style.top = menubar.offsetHeight;

        GUI.stats.style.left = canvas.right - 50;

        /*
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        offscreenCanvas.style.left = canvas.width - 50;
        offscreenCanvas.style.top= canvas.height - 50;
        */
        DRAW_MANAGER.redraw();
    }

    setState(state) {
        if (this.currentState == state)
            return;

        this.previousState = this.currentState;
        this.currentState = state;
        // console.log(this.previousState  + " --> " + this.currentState);
    }

    isPreviewing() {
        return this.currentState == StateEnum.RENDERPREVIEW; // ||
        //(currentState == StateEnum.PANNING && previousState == StateEnum.RENDERPREVIEW);
    }

    toggleGridVisiblity(senderButton) {
        showGrid = !showGrid;
        senderButton.innerHTML = showGrid ? "Hide grid" : "Show grid";
        DRAW_MANAGER.redraw();
    }

    toggleGrid() {
        if (GRID instanceof Grid)
            GRID = new TriangleGrid();
        else
            GRID = new Grid();

        DRAW_MANAGER.redraw();
    }

    adjustButtonText(button, val) {
        button.innerHTML = val ? button.getAttribute("enabledText") : button.getAttribute("disabledText");
    }
}