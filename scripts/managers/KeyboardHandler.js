class KeyboardHandler {
    constructor() {
        console.log("KeyboardHandler created.");

        this.recordInput = false;

        this.axisLock = "";
        this.digitsBeforeComma = "";
        this.digitsAfterComma = "";
        this.comma = false;
        this.callback = null;
    }

    KeyDown(e) {
        if (this.recordInput) {
            e.preventDefault();
            this.record(e.code + "", String.fromCharCode(e.keyCode));
            return;
        }
        switch (e.keyCode) {
            case 32: // Space
                spaceDown = true;
                RENDERER.redraw();
                break;
            case 82: // R
                if (e.shiftKey)
                    LINE_MANIPULATOR.rotate(false);
                else
                    LINE_MANIPULATOR.rotate(true);
                break;

            case 83: // S
                if (e.shiftKey) {
                    UTILITIES.snapSelectedPointsToGrid();
                }
                else if (e.ctrlKey) {
                    if (!EXPORTER.ExportAsSVG())
                        SAVER.autoSave();
                }
                else
                    LINE_MANIPULATOR.mirror();
                break;
            case 79: // O
                break;

            case 71: // G
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (!SELECTION.noSelection()) {
                        LOGIC.setState(StateEnum.GRABBING);
                        grabInitializedWithKeyboard = true;
                        MOUSE_HANDLER.startMoveLinesPreview();
                        RENDERER.redraw();
                    }
                }
                break;

            case 65: // A
                if (LOGIC.currentState == StateEnum.IDLE) {
                    FILE.selectAllToggle();
                    RENDERER.redraw();
                }

                break;

            case 88: // X
            case 46: // DEL
            case 8: // BACKSPACE
                if (LOGIC.currentState == StateEnum.IDLE) {
                    SELECTION.deleteSelection();
                    RENDERER.redraw();
                }

                break;
            case 73: // I
                if (LOGIC.currentState == StateEnum.IDLE) {
                    SELECTION.invertSelection();
                    RENDERER.redraw();
                }
                break;
            case 68: // D
                if (e.shiftKey) {
                    if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.GRABBING) {
                        if (!SELECTION.noSelection()) {

                            if (LOGIC.currentState == StateEnum.GRABBING)
                                MOUSE_HANDLER.endMoveLinesPreview();

                            FILE.duplicateLines();
                            MOUSE_HANDLER.startMoveLinesPreview();
                            LOGIC.setState(StateEnum.GRABBING);
                        }
                    }
                }
                else {
                    LOGIC.setState(StateEnum.CONTINOUSDRAWING);
                }
                break;

            case 9: // TAB
                if (!LOGIC.isPreviewing()) {
                    LOGIC.setState(StateEnum.RENDERPREVIEW);
                    canvas.style.background = 'white'; // TODO settings?
                    RENDERER.redraw();
                }
                break;

            case 67: // C
                if (LOGIC.currentState == StateEnum.IDLE)
                    SAVER.copyLinesToClipboard();
                break;

            case 86: // V
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (SAVER.pasteLines()) {
                        MOUSE_HANDLER.startMoveLinesPreview();
                        LOGIC.setState(StateEnum.GRABBING);
                    }
                }
                break;

            case 13: // Enter
                if (LOGIC.currentState == StateEnum.IDLE)
                    EXPORTER.TakeScreenshot();
                break;
            case 70: // F // TODO improve. CAMERA.zoom to selection / CAMERA.zoom fit / etc ... 
                CAMERA.setZoom(1);
                CAMERA.canvasOffset = (new Vector2(canvas.width * 0.5, canvas.height * 0.5)).divide(CAMERA.zoom);
                RENDERER.redraw();
                break;
            case 66: // B
                LOGIC.setState(StateEnum.BORDERSELECTION);
                RENDERER.redraw();
                break;
            case 187: // +
                LINE_MANIPULATOR.increaseSize(2);
                break;
            case 189: // -
                LINE_MANIPULATOR.increaseSize(0.5);
                break;

            case 16: // Shift
                if (LOGIC.currentState == StateEnum.IDLE)
                    drawPolyLine = true;
                break;
            case 17: // Ctrl
                tmpSwitchSnapToGrid = true;
                break;

            case 90: // Z
                ACTION_HISTORY.Undo();
                break;

            case 89: // Y
                ACTION_HISTORY.Redo();
                break;
            case 76: // L
                FILE.selectLinked();
                break;
            case 75: // K
                // TODO doesn't change button text...
                cutLines = !cutLines;
                break;

            case 77: // M
                // FILE.createNewLayer(true);
                UTILITIES.mergeSelectedPoints();
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

    KeyUp(e) {
        if (this.recordInput) {
            e.preventDefault();
            return;
        }

        switch (e.keyCode) {
            case 32: // Space
                spaceDown = false;
                RENDERER.redraw();
                break;

            case 9: // TAB
                if (LOGIC.currentState == StateEnum.RENDERPREVIEW) {
                    LOGIC.setState(LOGIC.previousState);
                    canvas.style.background = SETTINGS.canvasColor;
                    RENDERER.redraw();
                }
                break;

            case 16: // Shift
                if (LOGIC.currentState == StateEnum.DRAWING) {
                    if (drawPolyLine) {
                        drawPolyLine = false;
                        MOUSE_HANDLER.cancelLinePreview();
                    }
                }
                break;
            case 17: // Ctrl
                tmpSwitchSnapToGrid = false;
                break;

            case 18: // ALT
                tmpCutLines = false;
                break;

            case 68: // D
                if (LOGIC.currentState == StateEnum.CONTINOUSDRAWING)
                    LOGIC.setState(StateEnum.IDLE);
                break;
        }
    }

    arrowMovement(x, y, shiftDown, ctrlDown) {
        if (!SELECTION.noSelection()) {
            let stepSize = 10;
            if (shiftDown)
                stepSize = 1;
            if (ctrlDown)
                stepSize = 100;

            let delta = new Vector2(x * stepSize, y * stepSize);
            let selPoints = SELECTION.getAllSelectedPoints();
            UTILITIES.moveSelectionBy(selPoints, delta);
            RENDERER.redraw();
        }
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
            this.callback = null;

            this.recordInput = false;
            this.axisLock = "";
            this.digitsBeforeComma = "";
            this.digitsAfterComma = "";
            this.comma = false;

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

        console.log(code + ", " + char);

        GUI.writeToStatusbarLeft(this.getRecordedInputNumberAsString());
        //GUI.writeToStats("recordInput", this.recordInput);
        //GUI.writeToStats("axisLock", this.axisLock);
        //GUI.writeToStats("digitsBeforeComma", this.digitsBeforeComma);
        //GUI.writeToStats("digitsAfterComma", this.digitsAfterComma);
        //GUI.writeToStats("comma", this.comma);
    }

    getRecordedInputNumberAsString() {
        return +(this.digitsBeforeComma + "." + this.digitsAfterComma);
    }

    startRecordingInput(callback) {
        this.callback = callback
        this.recordInput = true;
    }

    testCallBack(num, axisLock) {
        console.log(num);
        console.log(axisLock);
    }
}