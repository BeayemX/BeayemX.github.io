class KeyboardHandler {
    constructor() {
        console.log("KeyboardHandler created.");

        this.grabStartPosition;
    }
    KeyDown(e) {
        switch (e.keyCode) {
            case 82: // R
                if (e.ctrlKey)
                    UTILITIES.reloadPage(true);
                else if (e.shiftKey)
                    LINE_MANIPULATOR.rotate(false);
                else
                    LINE_MANIPULATOR.rotate(true);
                break;
            case 116: // F5
                SAVER.autoSave();
                UTILITIES.reloadPage(false);
                break;

            case 83: // S
                if (e.ctrlKey)
                    SAVER.autoSave();
                else
                    LINE_MANIPULATOR.mirror();
                break;
            case 79: // O
                break;

            case 71: // G
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (DATA_MANAGER.currentFile.isSomethingSelected()) {
                        LOGIC.setState(StateEnum.GRABBING);
                        grabInitializedWithKeyboard = true;
                        // DON'T CALL WITH this.grabStartPosition because 'this' refers to caller, not THIS class!!!!
                        KEYBOARD_HANDLER.grabStartPosition = currentPosition.copy();
                        DRAW_MANAGER.redraw();
                    }
                }
                break;

            case 65: // A
                if (LOGIC.currentState == StateEnum.IDLE) {
                    DATA_MANAGER.currentFile.selectAllToggle();
                    DRAW_MANAGER.redraw();
                }

                break;

            case 88: // X
            case 46: // DEL
            case 8: // BACKSPACE
                if (LOGIC.currentState == StateEnum.IDLE) {
                    DATA_MANAGER.currentFile.deleteSelectedLines();
                    DRAW_MANAGER.redraw();
                }

                break;
            case 73: // I
                if (LOGIC.currentState == StateEnum.IDLE) {
                    DATA_MANAGER.currentFile.invertSelection();
                    DRAW_MANAGER.redraw();
                }
                break;
            case 68: // D
                if (LOGIC.currentState == StateEnum.IDLE || LOGIC.currentState == StateEnum.GRABBING) {
                    if (DATA_MANAGER.currentFile.isSomethingSelected()) {
                        DATA_MANAGER.currentFile.duplicateLines();
                        KEYBOARD_HANDLER.grabStartPosition = currentPosition.copy();
                        LOGIC.setState(StateEnum.GRABBING);
                    }
                }
                break;

            case 9: // TAB
                //if (currentState == StateEnum.IDLE)
                {
                    LOGIC.setState(StateEnum.RENDERPREVIEW);
                    canvas.style.background = 'white'; // TODO settings?
                    DRAW_MANAGER.redraw();
                }
                break;

            case 67: // C
                if (LOGIC.currentState == StateEnum.IDLE)
                    SAVER.copyLinesToClipboard();
                break;

            case 86: // V
                if (LOGIC.currentState == StateEnum.IDLE) {
                    if (SAVER.pasteLines()) {
                        KEYBOARD_HANDLER.grabStartPosition = currentPosition.copy();
                        LOGIC.setState(StateEnum.GRABBING);
                    }
                }
                break;

            case 13: // Enter
                if (LOGIC.currentState == StateEnum.IDLE)
                    EXPORTER.TakeScreenshot();
                break;
            case 70: // F // TODO improve. zoom to selection / zoom fit / etc ... 
                canvasOffset = new Vector2(canvas.width * 0.5, canvas.height * 0.5);
                canvasOffset = (new Vector2(canvas.width * 0.5, canvas.height * 0.5)).divide(zoom);
                DRAW_MANAGER.redraw();
                break;
            case 66: // B
                LOGIC.setState(StateEnum.BORDERSELECTION);
                DRAW_MANAGER.redraw();
                break;
            case 187: // +
                LINE_MANIPULATOR.increaseSize(2);
                break;
            case 189: // -
                LINE_MANIPULATOR.increaseSize(0.5);
                break;

            case 17: // Ctrl
                ctrlDown = true;
                break;

            case 90: // Z
                ACTION_HISTORY.Undo();
                break;

            case 89: // Y
                ACTION_HISTORY.Redo();
                break;
            case 76: // L
                DATA_MANAGER.currentFile.selectLinked();
                break;

                //default:
                //    console.log("KeyDown(): \n"
                //	    + "keyCode: " + e.keyCode + "\n"
                //	    + "ctrlKey: " + e.ctrlKey + "\n"
                //	    + "altKey: " + e.altKey + "\n"
                //	    + "shiftKey: " + e.shiftKey + "\n"
                //	    );
        }

        if (e.keyCode != 123 // F12
	    && !(e.keyCode == 76 && e.ctrlKey) // ctrl+L, 
	    && e.keyCode != 117) // F6
            e.preventDefault();
    }

    KeyUp(e) {
        switch (e.keyCode) {
            case 9: // TAB
                if (LOGIC.currentState == StateEnum.RENDERPREVIEW) {
                    LOGIC.setState(LOGIC.previousState);
                    canvas.style.background = SETTINGS.canvasColor;
                    DRAW_MANAGER.redraw();
                }
                break;

            case 17: // Ctrl
                if (ctrlDown) {
                    ctrlDown = false;
                    MOUSE_HANDLER.CancelLinePreview();
                }
                break;
        }
    }
}