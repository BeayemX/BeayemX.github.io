class KeyboardHandler {
    static init() {
        console.log("KeyboardHandler created.");
        this.inputRecorder = null;
    }

    static keyDown(e) {
        if (this.inputRecorder != null) {
            e.preventDefault();
            this.inputRecorder.record(e.code + "", String.fromCharCode(e.keyCode));
            return;
        }

        switch (e.keyCode) {
            case 13: // Enter
                break;
            case 81: // Q
                this.inputRecorder = new InputRecorder(this.testCallBack);
                break;
            default:
                break;
        }

        if (MouseHandler.canvasFocused)
            CanvasKeyHandler.KeyDown(e);


        if (
            e.keyCode == 9 // Tab
        )
            e.preventDefault();
    }

    static keyUp(e) {
        if (this.inputRecorder != null) {
            e.preventDefault();
            return;
        }

        switch (e.keyCode) {
            case 32: // Space
                break;
            default:
                break;
        }

        if (MouseHandler.canvasFocused)
            CanvasKeyHandler.KeyUp(e);
    }

    static testCallBack(num, axisLock) {
        console.log(num);
        console.log(axisLock);
        // TODO? stupid javascript-this behaviour, therefore have to call "this" with class name...
        KeyboardHandler.inputRecorder = null;
    }
}

class CanvasKeyHandler {
    constructor() {
        console.log("CanvasKeyHandler created.");
    }

    static KeyDown(e) {        
        switch (e.keyCode) {
            case 32: // Space
                spaceDown = true;
                Renderer.redraw();
                break;
            case 82: // R
                if (e.shiftKey)
                    LineManipulator.rotate(false);
                else
                    LineManipulator.rotate(true);
                break;

            case 83: // S
                if (e.shiftKey) {
                    Utilities.snapSelectedPointsToGrid();
                }
                else if (e.ctrlKey) {
                    if (!Exporter.ExportAsSVG())
                        Saver.autoSave();
                }
                else
                    LineManipulator.mirror();
                break;
            case 79: // O
                break;

            case 71: // G
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (!Selection.noSelection()) {
                        LOGIC.setState(StateEnum.GRABBING);
                        grabInitializedWithKeyboard = true;
                        MouseHandler.startMoveLinesPreview();
                        Renderer.redraw();
                    }
                }
                break;

            case 65: // A
                if (LOGIC.currentState == StateEnum.IDLE) {
                    File.selectAllToggle();
                    Renderer.redraw();
                }

                break;

            case 88: // X
            case 46: // DEL
            case 8: // BACKSPACE
                if (LOGIC.currentState == StateEnum.IDLE) {
                    Selection.deleteSelection();
                    Renderer.redraw();
                }

                break;
            case 73: // I
                if (LOGIC.currentState == StateEnum.IDLE) {
                    Selection.invertSelection();
                    Renderer.redraw();
                }
                break;
            case 68: // D
                if (e.shiftKey) {
                    if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.GRABBING) {
                        if (!Selection.noSelection()) {

                            if (LOGIC.currentState == StateEnum.GRABBING)
                                MouseHandler.endMoveLinesPreview();

                            File.duplicateLines();
                            MouseHandler.startMoveLinesPreview();
                            LOGIC.setState(StateEnum.GRABBING);
                        }
                    }
                }
                else {
                    if (LOGIC.currentState != StateEnum.CONTINOUSDRAWING) {
                        MouseHandler.cancelLinePreview();
                        LOGIC.setState(StateEnum.CONTINOUSDRAWING);
                    }
                }
                break;

            case 9: // TAB
                if (!LOGIC.isPreviewing()) {
                    LOGIC.isRenderPreviewing = true;
                    canvas.style.background = 'white'; // TODO settings?
                    Renderer.redraw();
                }
                break;

            case 67: // C
                if (LOGIC.currentState == StateEnum.IDLE)
                    Saver.copyLinesToClipboard();
                break;

            case 86: // V
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (Saver.pasteLines()) {
                        MouseHandler.startMoveLinesPreview();
                        LOGIC.setState(StateEnum.GRABBING);
                    }
                }
                break;

            case 13: // Enter
                if (LOGIC.currentState == StateEnum.IDLE)
                    Exporter.TakeScreenshot();
                break;
            case 70: // F // TODO improve. Camera.zoom to selection / Camera.zoom fit / etc ... 
                Camera.setZoom(1, false);
                Camera.canvasOffset = (new Vector2(canvas.width * 0.5, canvas.height * 0.5)).divide(Camera.zoom);
                Renderer.redraw();
                break;
            case 66: // B
                LOGIC.setState(StateEnum.BORDERSelection);
                Renderer.redraw();
                break;
            case 187: // +
                LineManipulator.increaseSize(2);
                break;
            case 189: // -
                LineManipulator.increaseSize(0.5);
                break;

            case 16: // Shift
                if (LOGIC.currentState == StateEnum.IDLE)
                    drawPolyLine = true;
                break;
            case 17: // Ctrl
                tmpSwitchSnapToGrid = true;
                break;

            case 90: // Z
                ActionHistory.Undo();
                break;

            case 89: // Y
                ActionHistory.Redo();
                break;
            case 76: // L
                File.selectLinked();
                break;
            case 75: // K
                // TODO doesn't change button text...
                cutLines = !cutLines;
                break;

            case 77: // M
                // File.createNewLayer(true);
                Utilities.mergeSelectedPoints();
                break;

            case 37: // ARROW LEFT
                this.arrowMovement(-1, 0, e.shiftKey, e.ctrlKey);
                break;
            case 38: // ARROW UP
                this.arrowMovement(0, -1, e.shiftKey, e.ctrlKey);
                break;
            case 39: // ARROW RIGHT
                this.arrowMovement(1, 0, e.shiftKey, e.ctrlKey);
                break;
            case 40: // ARROW DOWN
                this.arrowMovement(0, 1, e.shiftKey, e.ctrlKey);
                break;
            case 18: // ALT
                tmpCutLines = true;
                break;

                /*
                case 69: // E
                this.startRecordingInput(this.testCallBack);
                break;
                // */

            case 27: // ESC
                LOGIC.previousState = StateEnum.IDLE;
                LOGIC.setState(StateEnum.IDLE);
                console.log("cleared States");
                // TODO also reset ctrlDown and so on?
                break;

            default:
                console.log(e);
                GUI.notify(String.fromCharCode(e.keyCode) + " (" + e.keyCode + ") pressed.");
                break;
        }

        if (e.keyCode != 123 // F12
	    && !(e.keyCode == 76 && e.ctrlKey) // ctrl+L, 
	    && e.keyCode != 117 // F6
        && e.keyCode != 116 // F5
        )
            e.preventDefault();
    }

    static KeyUp(e) {
        switch (e.keyCode) {
            case 32: // Space
                spaceDown = false;
                Renderer.redraw();
                break;

            case 9: // TAB
                if (LOGIC.isPreviewing()) {
                    //LOGIC.setState(LOGIC.previousState);
                    LOGIC.isRenderPreviewing = false;
                    canvas.style.background = Settings.canvasColor;
                    Renderer.redraw();
                }
                break;

            case 16: // Shift
                if (LOGIC.currentState == StateEnum.DRAWING) {
                    if (drawPolyLine) {
                        MouseHandler.cancelLinePreview();
                    }
                }
                drawPolyLine = false;
                break;
            case 17: // Ctrl
                tmpSwitchSnapToGrid = false;
                break;

            case 18: // ALT
                tmpCutLines = false;
                break;

            case 68: // D
                if (LOGIC.currentState == StateEnum.CONTINOUSDRAWING)
                    LOGIC.setState(LOGIC.previousState);
                break;
        }
    }

    static arrowMovement(x, y, shiftDown, ctrlDown) {
        if (!Selection.noSelection()) {
            let stepSize = 10;
            if (shiftDown)
                stepSize = 1;
            if (ctrlDown)
                stepSize = 100;

            let delta = new Vector2(x * stepSize, y * stepSize);
            let selPoints = Selection.getAllSelectedPoints();
            Utilities.moveSelectionBy(selPoints, delta);
            Renderer.redraw();
        }
    }
}

class InputRecorder {
    constructor(callback) {
        // capture keys
        // how to return value?

        this.axisLock = "";
        this.digitsBeforeComma = "";
        this.digitsAfterComma = "";
        this.comma = false;
        this.callback = callback;
    }

    getRecordedInputNumberAsString() {
        return +(this.digitsBeforeComma + "." + this.digitsAfterComma);
    }

    record(code, char) {
        //48 - 57
        if (code.includes("Digit")) {
            //if (!isNaN(char)) {
            if (this.comma)
                this.digitsAfterComma += char;
            else
                this.digitsBeforeComma += char;
        }
        else if (code.includes("Key")) {
            if (char == "X") {
                if (this.axisLock == "X")
                    this.axisLock = "";
                else
                    this.axisLock = char;
            }
            else if (char == "Y") {
                if (this.axisLock == "Y")
                    this.axisLock = "";
                else
                    this.axisLock = char;
            }
        }
        else if (code == "Comma" || code == "Period") {
            this.comma = true;
        }
        else if (code == "Enter") {

            this.callback(this.getRecordedInputNumberAsString(), this.axisLock);
            //this.callback = null;
            //this.recordInput = false;
            //this.axisLock = "";
            //this.digitsBeforeComma = "";
            //this.digitsAfterComma = "";
            //this.comma = false;
            return;
        }
        else if (code == "Backspace") {
            if (this.digitsAfterComma.length > 0)
                this.digitsAfterComma = this.digitsAfterComma.slice(0, this.digitsAfterComma.length - 1);
            else if (this.comma)
                this.comma = false;
            else if (this.digitsBeforeComma.length > 0)
                this.digitsBeforeComma = this.digitsBeforeComma.slice(0, this.digitsBeforeComma.length - 1);
        }

        //console.log(code + ", " + char);

        GUI.writeToStatusbarLeft(this.getRecordedInputNumberAsString());
        //GUI.writeToStats("recordInput", this.recordInput);
        //GUI.writeToStats("axisLock", this.axisLock);
        //GUI.writeToStats("digitsBeforeComma", this.digitsBeforeComma);
        //GUI.writeToStats("digitsAfterComma", this.digitsAfterComma);
        //GUI.writeToStats("comma", this.comma);
    }    
}