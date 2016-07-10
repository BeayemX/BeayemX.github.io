var canvas;
var context;
var offscreenCanvas;
var offscreenContext;

var currentPosition = new Vector2(0, 0);
let selectionCursor = new Vector2(0, 0);
var canvasOffset = new Vector2(0, 0);
var zoom = 1;

var drawPolyLine;
var grabInitializedWithKeyboard = false;

let cursorRange = 9;

let SAVER;
let FILE;
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

let cutLines = false;
let tmpCutLines = false;
let waitingForStart = [];

function onLoad() {
    KEYBOARD_HANDLER = new KeyboardHandler();
    MOUSE_HANDLER = new MouseHandler();
    LOGIC = new Logic();
    SAVER = new Saver();
    FILE = new File();
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
        window.addEventListener("keydown", KEYBOARD_HANDLER.KeyDown, false)
        window.addEventListener("keyup", KEYBOARD_HANDLER.KeyUp, false)
        window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
        window.addEventListener('resize', this.layoutGUI, false);
        window.onbeforeunload = function () {
            SAVER.autoSave();
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

        canvasOffset.x = canvas.width * 0.5;
        canvasOffset.y = canvas.height * 0.5;

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

class Selection {
    constructor() {
        console.log("Selection created");
        this.selectedPoints = [];
        this.selectedLines = [];
    }

    addPoint(point) {
        for (let p of this.selectedPoints) {
            if (p === point)
                return;
        }
        let other = point.opposite;
        // check if other is also selected
        for (let p of this.selectedPoints) {
            if (p === other) {
                this.selectedLines.push(point.line);
                UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line)
                UTILITIES.deleteArrayEntry(this.selectedPoints, other);
                return;
            }
        }
        this.selectedPoints.push(point);
    }

    removePoint(point) {
        for (var i = this.selectedPoints - 1; i >= 0; --i) {
            if (this.selectedPoints[i] === point) {
                UTILITIES.deleteArrayEntry(this.selectedPoints, this.selectedPoints[i]);
                return;
            }
        }
        for (var i = this.selectedLines - 1; i >= 0; --i) {
            if (point === this.selectedLines[i].start || point === this.selectedLines[i].end) {
                FILE.currentLayer.lines.push(this.selectedLines[i]);
                UTILITIES.deleteArrayEntry(this.selectedLines, this.selectedLines[i]);

                this.selectedPoints.push(point.opposite);
            }
        }
    }

    // TODO should check if point is already selected 
    //DONT USE
    addLine(line) {
        console.log("Dangerous use!");
        this.selectedLines.push(line);
        UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, line);
        FILE.updateStats();
    }

    clearSelection() {
        FILE.currentLayer.lines = FILE.currentLayer.lines.concat(this.selectedLines);
        this.selectedPoints = [];
        this.selectedLines = [];
        FILE.currentLayer.cleanUpFile();
    }

    selectEverything() {
        this.clearSelection();
        this.selectedLines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = [];
    }

    noSelection() {
        return this.selectedPoints.length == 0 && this.selectedLines.length == 0;
    }

    invertSelection() {
        let tmp = this.selectedLines;
        this.selectedLines = FILE.currentLayer.lines;
        FILE.currentLayer.lines = tmp;

        for (var i = 0; i < this.selectedPoints.length; i++) {
            this.selectedPoints[i] = this.selectedPoints[i].opposite;
        }
    }

    deleteSelectedLines() {
        this.selectedLines = [];

        // TODO PERFORMANCE maybe use slice here, becaus 'deleteArrayEntry iterates over whole array for every delete...
        for (let point of this.selectedPoints)
            UTILITIES.deleteArrayEntry(FILE.currentLayer.lines, point.line);

        this.selectedPoints = [];
        FILE.updateStats();
    }

    getAllSelectedPoints() {
        return UTILITIES.linesToPoints(this.selectedLines).concat(this.selectedPoints);
    }

    isPointSelected(point) {
        for (let p of this.selectedPoints) {
            if (p == point) {
                return true;
            }
        }
        for (let l of this.selectedLines) {
            if (point == l.start || point === l.end) {
                return true;
            }
        }

        return false;
    }

    changeSelectionForPoints(points) {
        for (let p of points) {
            if (this.isPointSelected(p))
                this.removePoint(p);
            else
                this.addPoint(p);
        }
    }
}