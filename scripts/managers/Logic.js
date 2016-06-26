"use strict";

var canvas;
var context;

var currentPosition = new Vector2(0, 0);
let selectionCursor = new Vector2(0, 0);
var canvasOffset = new Vector2(0, 0);
var zoom = 1;

var advancedHandlesButton;
var ctrlDown;
var grabInitializedWithKeyboard = false;

let cursorRange = 9;


let SAVER;
let DATA_MANAGER;
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

let GRID;
let useGrid = true;

function onLoad()
{
    KEYBOARD_HANDLER = new KeyboardHandler();
    MOUSE_HANDLER = new MouseHandler();
    LOGIC = new Logic();
    SAVER = new Saver();
    DATA_MANAGER = new DataManager();
    DRAW_MANAGER = new DrawManager();
    GUI = new Gui();
    UTILITIES = new Utilities();
    EXPORTER = new Exporter();
    ACTION_HISTORY = new ActionHistory();
    LINE_MANIPULATOR = new LineManipulator();
    SETTINGS = new Settings();
    // SIFU FIXME TODO save grid elsewhere
    GRID = new Grid(); 
    //GRID = new TriangleGrid(); 


    LOGIC.start();
}

class Logic {
    constructor()
    {
        console.log("Logic created.");

        this.currentState = StateEnum.IDLE;
        this.previousState = StateEnum.IDLE;
    }
    
    start()
    {
        window.addEventListener("keydown", KEYBOARD_HANDLER.KeyDown, false)
        window.addEventListener("keyup", KEYBOARD_HANDLER.KeyUp, false)
        window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
        window.addEventListener('resize', this.layoutGUI, false);

        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        advancedHandlesButton = document.getElementById('advancedHandlesButton');
        LINE_MANIPULATOR.updateAdvancedHandlesButton();

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
    
        SAVER.loadAutoSave();
        DATA_MANAGER.currentFile.updateStats();
        DRAW_MANAGER.redraw();
    }

    layoutGUI()
    {
        GUI.notificationarea.style.top = 0;
        canvas.width = window.innerWidth - leftarea.offsetWidth;

        if (rightarea.style.visibility == "visible")
            canvas.width -= rightarea.offsetWidth;

        canvas.height = window.innerHeight - GUI.menubar.offsetHeight - GUI.statusbar.offsetHeight;
        canvas.style.left = leftarea.offsetWidth;
        canvas.style.top = menubar.offsetHeight;

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

    toggleGridVisiblity(senderButton)
    {
        useGrid = !useGrid;
        this.adjustToggleGridButton(senderButton);
        DRAW_MANAGER.redraw();
    }

    adjustToggleGridButton(senderButton)
    {
        senderButton.innerHTML = useGrid ? "Hide grid" : "Show grid";
    }

    toggleGrid()
    {
        if (GRID instanceof Grid)
            GRID = new TriangleGrid();
        else
            GRID = new Grid();

        DRAW_MANAGER.redraw();
    }
}