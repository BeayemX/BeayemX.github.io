var grabStartPosition;
function KeyDown(e)
{
	switch(e.keyCode)
	{
		case 82: // R
			ReloadPage(true);
			break;
		case 116: // F5
			ReloadPage(false);
			break;

		case 83: // S
			if (e.ctrlKey)
				Save();
			break;
		case 79:
			if (e.ctrlKey)
				Open();
			break;

		case 46: // DEL
			DeleteSavedLogo();
			break;
		case 71: // G
			// TODO create isSthSelected() which returns after first find...
			if (state == StateEnum.IDLE)
			{
				if (GetAllSelectedPoints().length > 0) 
				{
					state = StateEnum.GRABBING;
					grabStartPosition = currentGridPosition;
				}
			}
			break;

		case 65: // A
			if (state == StateEnum.IDLE)
				SelectAllToggle();
			break;

		case 88: // X
			if (state == StateEnum.IDLE)
				DeleteSelectedLines();
			break;
		case 73: // I
			if (state == StateEnum.IDLE)
				InvertSelection();
			break;
		case 68:
			if (state == StateEnum.IDLE)
			{
				DuplicateLines();
				state = StateEnum.GRABBING;
			}	
			break;

		case 9: // TAB
			if (state == StateEnum.IDLE)
			{
				state = StateEnum.RENDERPREVIEW;
	  			canvas.style.background = 'white';
				Redraw();
			}
			break;

		case 67: // C
			if (state == StateEnum.IDLE)
				CopyLinesToClipboard();
			break;

		case 86: // V
			if (state == StateEnum.IDLE)
			{	
				PasteLines();
				state = StateEnum.GRABBING;
			}
			break;

		case 13: // Enter
			if (state == StateEnum.IDLE)
				TakeScreenshot();
			break;

		default:
			console.log("KeyDown(): \n"
				+ "keyCode: " + e.keyCode + "\n"
				+ "ctrlKey: " + e.ctrlKey + "\n"
				+ "altKey: " + e.altKey + "\n"
				+ "shiftKey: " + e.shiftKey + "\n"
				);
	}

	if (e.keyCode != 123) // F12
		e.preventDefault();
}


function KeyUp(e)
{
	switch(e.keyCode)
	{
		case 9: // TAB
			state = StateEnum.IDLE;
  			canvas.style.background = canvasColor;
			Redraw();
			break;
	}
}