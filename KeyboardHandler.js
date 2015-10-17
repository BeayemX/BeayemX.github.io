var grabStartPosition;
function KeyDown(e)
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
			// TODO create isSthSelected() which returns after first find...
			if (currentState == StateEnum.IDLE)
			{
				if (GetAllSelectedPoints().length > 0) 
				{
					SetState(StateEnum.GRABBING);
					grabStartPosition = currentGridPosition;
				}
			}
			break;

		case 65: // A
			if (currentState == StateEnum.IDLE)
				SelectAllToggle();
			break;

		case 88: // X
			if (currentState == StateEnum.IDLE)
				DeleteSelectedLines();
			break;
		case 73: // I
			if (currentState == StateEnum.IDLE)
				InvertSelection();
			break;
		case 68:
			if (currentState == StateEnum.IDLE || currentState == StateEnum.GRABBING)
			{
				DuplicateLines();
				SetState(StateEnum.GRABBING);
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
					SetState(StateEnum.GRABBING);
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
		default:
			console.log("KeyDown(): \n"
				+ "keyCode: " + e.keyCode + "\n"
				+ "ctrlKey: " + e.ctrlKey + "\n"
				+ "altKey: " + e.altKey + "\n"
				+ "shiftKey: " + e.shiftKey + "\n"
				);
			Notify("Keycode: " + e.keyCode);
	}

	if (e.keyCode != 123) // F12
		e.preventDefault();
}


function KeyUp(e)
{
	switch(e.keyCode)
	{
		case 9: // TAB
			SetState(previousState);
  			canvas.style.background = canvasColor;
			Redraw();
			break;
	}
}