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

let snapToGrid = true;
let tmpSwitchSnapToGrid = false;

let showGrid = true;

let spaceDown = false;
let cutLines = false;
let tmpCutLines = false;
let waitingForStart = [];

let mirrorX = false;
let mirrorY = false;

function onLoad() {
    KeyboardHandler.init();
    MouseHandler.init();
    Logic.init();
    Saver.init();
    File.init();
    Camera.init();
    Renderer.init();

    GUI.init();
    Utilities.init();
    Exporter.init();
    ActionHistory.init();
    LineManipulator.init();
    Settings.init();
    Selection.init();
    GridManager.init();

    GUI.genereateGridSettings();

    Logic.start();
}

class Logic {
    static init() {
        console.log("Logic created.");

        this.currentState = StateEnum.IDLE;
        this.previousState = StateEnum.IDLE;
        this.isRenderPreviewing = false;
    }

    static start() {
        window.addEventListener("keydown", evt => KeyboardHandler.keyDown(evt), false);
        window.addEventListener("keyup", evt => KeyboardHandler.keyUp(evt), false);

        // window.addEventListener("keydown", evt => CanvasKeyHandler.KeyDown(evt), false);
        // window.addEventListener("keyup", evt => CanvasKeyHandler.KeyUp(evt), false);

        window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
        window.addEventListener('resize', this.layoutGUI, false);
        window.addEventListener('focus', function () {
            tmpCutLines = false;
            GUI.notify("received focus");
        }, false);
        window.onbeforeunload = function () {
            Saver.autoSave();
        };

        window.onerror = function () {
            GUI.notify("<font color='red'>An error occured! Press F12 to see what went wrong.</font>");
        };

        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        offscreenCanvas = document.getElementById('offscreenCanvas');
        offscreenContext = offscreenCanvas.getContext('2d');

        canvas.addEventListener("mousemove", evt => MouseHandler.mouseMove(evt));
        canvas.addEventListener("mouseup", evt => MouseHandler.mouseUp(evt));
        canvas.addEventListener("mousedown", evt => MouseHandler.mouseDown(evt));
        canvas.addEventListener("mousewheel", evt => MouseHandler.mouseScroll(evt));

        canvas.addEventListener("mouseenter", evt => MouseHandler.canvasMouseEnter(evt));
        canvas.addEventListener("mouseleave", evt => MouseHandler.canvasMouseLeave(evt));
        
        // Setup the dnd listeners.
        let dropZone = document.body;
        dropZone.addEventListener('dragover', Saver.handleDragOver, false);
        dropZone.addEventListener('drop', Saver.handleFileSelect, false);

        canvas.style.background = Settings.canvasColor;
        this.layoutGUI();

        Camera.canvasOffset.x = canvas.width * 0.5;
        Camera.canvasOffset.y = canvas.height * 0.5;

        //Saver.loadAutoSave();
        Saver.newFile();

        File.updateStats();
        Renderer.redraw();

        for (var i = 0; i < waitingForStart.length; i++) {
            waitingForStart[i].start();
        }
    }

    static layoutGUI() {
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
        Renderer.redraw();
    }

    static setState(state) {
        if (this.currentState == state)
            return;

        this.previousState = this.currentState;
        this.currentState = state;
        // console.log(this.previousState  + " --> " + this.currentState);
    }

    static isPreviewing() {
        return Logic.isRenderPreviewing;
    }

    static toggleGridVisiblity(senderButton) {
        showGrid = !showGrid;
        senderButton.innerHTML = showGrid ? "Hide grid" : "Show grid";
        Renderer.redraw();
    }

    static adjustButtonText(button, val) {
        button.innerHTML = val ? button.getAttribute("enabledText") : button.getAttribute("disabledText");
    }

    static shouldSnap() {
        return (snapToGrid && !tmpSwitchSnapToGrid) || (!snapToGrid && tmpSwitchSnapToGrid);
    }
}