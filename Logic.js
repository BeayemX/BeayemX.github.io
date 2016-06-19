"use strict";

var canvas;
var context;

var currentGridPosition = new GridPoint();
var canvasOffset = { x: 0, y: 0 };

var showGrid = true; // TODO RENAME

var advancedHandlesButton;
var ctrlDown;
var grabInitializedWithKeyboard = false;


// SIFU TODO write in all caps... not posssible for gui..
let saver;
let DATA_MANAGER;
let DRAW_MANAGER;
let keyboardHandler;
let mouseHandler;
let LOGIC;
let GUI;
let UTILITIES;

function onLoad()
{
    keyboardHandler = new KeyboardHandler();
    mouseHandler = new MouseHandler();
    LOGIC = new Logic();
    saver = new Saver();
    DATA_MANAGER = new DataManager();
    DRAW_MANAGER = new DrawManager();
    GUI = new Gui();
    UTILITIES = new Utilities();

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
        window.addEventListener("keydown", keyboardHandler.KeyDown, false)
        window.addEventListener("keyup", keyboardHandler.KeyUp, false)
        window.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
        window.addEventListener('resize', this.layoutGUI, false);

        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        


        advancedHandlesButton = document.getElementById('advancedHandlesButton');
        UpdateAdvancedHandlesButton();

        canvas.addEventListener("mousemove", MouseMove);
        canvas.addEventListener("mouseup", MouseUp);
        canvas.addEventListener("mousedown", MouseDown);
        canvas.addEventListener("mousewheel", MouseScroll);
        canvas.addEventListener("mouseleave", MouseHandler.MouseLeave);

        notificationarea.addEventListener("mouseenter", GUI.notificationEnter);
        notificationarea.addEventListener("mouseout", GUI.notificationExit);

        // savedfilesdropdown.addEventListener("change", DropDownSelected)

        // Setup the dnd listeners.
        let dropZone = document.body;
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

        canvas.style.background = canvasColor;
        this.layoutGUI();

        canvasOffset.x = canvas.width * 0.5;
        canvasOffset.y = canvas.height * 0.5;

    
        saver.loadAutoSave();

        DATA_MANAGER.currentFile.updateStats();
        DRAW_MANAGER.redraw();
        TestActionHistory(); // SIFU remove
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

    isState(states) {
        for (var i = 0; i < arguments.length; i++) {
            if (this.currentState == arguments[i])
                return true;
        }
        return false;
    }
}