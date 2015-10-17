var autosaveFileName = "AutoSave";
var clipboardFileName = "Clipboard";

function Save()
{
	var logoName = prompt("Save logo as: ");
	if (!logoName)
	{
		alert("Invalid name. Logo not saved!");
		return;
	}

	var logo = localStorage.getItem(logoName);
	if (logo)
	{
		if(!confirm("Logo with that name already exists. Do you want to overwrite it?"))
		{
			alert("Not overwritten bla bla")
			return;
		}
	}

	localStorage.setItem(logoName, JSON.stringify(lines));
	UpdateDropdown(logoName);
}

function Open(logoName)
{
	/*
	var text = "Open logo: \n";
	// var keys = [];
	for(var i=0; i<localStorage.length; ++i) 
	{
		//keys.push(localStorage.key(i));
		text += "- " + localStorage.key(i) + "\n";
	    // var key = localStorage.key(i);
	    // var value = localStorage[key];
	    // console.log(key + " => " + value);
	}

	var logoName = prompt(text);
	if (!logoName)
	{
		alert("Invalid name!");
		return;
	}
	
	*/
	var logo = localStorage.getItem(logoName);

	if (!logo)
	{
		alert("Logo doesn't exist!");
		return;
	}

	var linesArray = JSON.parse(logo);

	lines = [];
	for (var i=0; i<linesArray.length; ++i)
	{
		lines.push(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y
			)
		);
	}
	Redraw();
}

function DeleteSavedLogo(logoName)
{
	if (!logoName)
		logoName = prompt("Which logo should be deleted?")

	var logo = localStorage.getItem(logoName);
	if (logo)
	{
		localStorage.removeItem(logoName);
		console.log("deleted")
	}
	UpdateDropdown();
}

function CopyLinesToClipboard()
{
	var selectedLines = GetSelectedLines();
	sessionStorage.setItem(clipboardFileName, JSON.stringify(selectedLines));
	Notify("Lines copied to clipboard!");
}

function PasteLines()
{
	var logo = sessionStorage.getItem(clipboardFileName);
	if (!logo)
		return false;

	ClearSelection();	

	var linesArray = JSON.parse(logo);

	for (var i=0; i<linesArray.length; ++i)
	{
		lines.push(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y, 
				true
			)
		);
	}
	Notify("Lines pasted from clipboard!");
	Redraw();
	return true;
}

function TakeScreenshot()
{
	var w=window.open('about:blank','image from canvas');
	// also save blueprint
	//w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

	state = StateEnum.RENDERPREVIEW;
	Redraw();
	w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

	state = StateEnum.IDLE;
	Redraw();
	Notify("Picture saved!");
}

function AutoSave()
{
	Notify("AutoSaved!");
	sessionStorage.setItem(autosaveFileName, JSON.stringify(lines));
	UpdateDropdown();
}

function LoadAutoSave()
{
	var logo = sessionStorage.getItem(autosaveFileName);
	if (!logo)
		return false;

	lines = [];
	var linesArray = JSON.parse(logo);

	for (var i=0; i<linesArray.length; ++i)
	{
		lines.push(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y
			)
		);
	}
	Notify("AutoSave loaded!");
	Redraw();
	return true;	
}

function UpdateDropdown(lastAddedLogoName)
{
	while (savedfilesdropdown.lastChild) 
 		savedfilesdropdown.removeChild(savedfilesdropdown.lastChild);

	var keys = [];

	for(var i=0; i<localStorage.length; ++i) 
		keys.push(localStorage.key(i));



	var firstEntry = document.createElement("option");
	firstEntry.setAttribute("disabled", "");
	firstEntry.setAttribute("selected", "");
	firstEntry.setAttribute("display", "none");
	firstEntry.textContent = "Select file to load";
	firstEntry.value = "";
	savedfilesdropdown.appendChild(firstEntry)

	var selectedIndex = 0;
	for (var i=0; i<keys.length; ++i)
	{
		var element = document.createElement("option");
		element.textContent = keys[i];
		element.value = keys[i];
		savedfilesdropdown.appendChild(element);

		if (keys[i] == lastAddedLogoName)
			selectedIndex = i + 1;
	}

 	savedfilesdropdown.selectedIndex = selectedIndex;
}

function DropDownSelected()
{
	Open(savedfilesdropdown.options[ savedfilesdropdown.selectedIndex ].value);
}