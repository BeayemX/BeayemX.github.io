"use strict"

class KeyboardHandler
{
    constructor()
    {
        this.grabStartPosition;
    }
     KeyDown(e)
     {
         switch(e.keyCode)
         {
             case 82: // R
                 if (e.ctrlKey)
                     ReloadPage(true);
                 else if (e.shiftKey)
                     Rotate(false);
                 else 
                     Rotate(true);
                 break;
             case 116: // F5
                 AutoSave();
                 ReloadPage(false);
                 break;

             case 83: // S
                 if (e.ctrlKey)
                     Save();
                 else
                     Mirror();
                 break;
             case 79: // O
                 break;

             case 46: // DEL
                 DeleteSavedLogo();
                 break;
             case 71: // G
                 if (currentState == StateEnum.IDLE)
                 {
                     if (currentProject.currentFile.IsSomethingSelected()) 
                     {
                         SetState(StateEnum.GRABBING);
                         // DON'T CALL WITH this.grabStartPosition because 'this' refers to caller, not THIS class!!!!
                         keyboardHandler.grabStartPosition = currentGridPosition.Copy();
                     }
                 }
                 break;

             case 65: // A
                 if (currentState == StateEnum.IDLE)
                 {
                     currentProject.currentFile.SelectAllToggle();
                     Redraw();
                 }

			    break;

		    case 88: // X
		        if (currentState == StateEnum.IDLE)
                {
		            currentProject.currentFile.DeleteSelectedLines();
			        Redraw();
		        }

			    break;
		    case 73: // I
		        if (currentState == StateEnum.IDLE)
		        {
			        currentProject.currentFile.InvertSelection();
			        Redraw();
		        }
			    break;
		    case 68: // D
			    if (currentState == StateEnum.IDLE || currentState == StateEnum.GRABBING)
			    {
			        if (currentProject.currentFile.IsSomethingSelected())
                    {
			            currentProject.currentFile.DuplicateLines();
			            keyboardHandler.grabStartPosition = currentGridPosition.Copy();
				        SetState(StateEnum.GRABBING);
			        }
			    }	
			    break;

		    case 9: // TAB
			    //if (currentState == StateEnum.IDLE)
			    {
				    SetState(StateEnum.RENDERPREVIEW);
	  			    canvas.style.background = 'white';
				    Redraw();
			    }
			    break;

		    case 67: // C
			    if (currentState == StateEnum.IDLE)
				    CopyLinesToClipboard();
			    break;

		    case 86: // V
			    if (currentState == StateEnum.IDLE)
			    {	
			        if (PasteLines())
			        {
			            keyboardHandler.grabStartPosition = currentGridPosition.Copy();
			            SetState(StateEnum.GRABBING);
                    }
			    }
			    break;

		    case 13: // Enter
			    if (currentState == StateEnum.IDLE)
				    TakeScreenshot();
			    break;
		    case 70: // F // TODO improve. zoom to selection / zoom fit / etc ... 
			    canvasOffset = {x: canvas.width * 0.5, y: canvas.height * 0.5 };
			    Redraw();
			    break;
		    case 66: // B
			    SetState(StateEnum.BORDERSELECTION);
			    Redraw();
		    break;
		    case 27:
			    ToggleDevArea();
			    break;
            case 187: // +
                IncreaseSize(2);
                break;
	        case 189: // -
	            IncreaseSize(0.5);
	            break;

	        case 17: // Ctrl
	            showAdvancedHandles = !advancedHandlesState;
	            GetNearestSelection(GridpointToScreenpoint(currentGridPosition));
	            UpdateAdvancedHandlesButton();
	            Redraw();
	            break;

	        case 90: // Z
	            actionhistory.Undo();
	            break;

	        case 89: // Y
	            actionhistory.Redo();
	            break;

		    default:
			    console.log("KeyDown(): \n"
				    + "keyCode: " + e.keyCode + "\n"
				    + "ctrlKey: " + e.ctrlKey + "\n"
				    + "altKey: " + e.altKey + "\n"
				    + "shiftKey: " + e.shiftKey + "\n"
				    );
	    }

	    if (e.keyCode != 123 // F12
	    && !(e.keyCode == 76 && e.ctrlKey) // ctrl+L, 
	    &&  e.keyCode!=117 ) // F6
            e.preventDefault();
    }

    KeyUp(e)
    {
	    switch(e.keyCode)
	    {
		    case 9: // TAB
			    SetState(previousState);
  			    canvas.style.background = canvasColor;
			    Redraw();
			    break;

	        case 17: // Ctrl
	            showAdvancedHandles = advancedHandlesState;
	            UpdateAdvancedHandlesButton();
	            Redraw();
	            break;
	    }
    }
}