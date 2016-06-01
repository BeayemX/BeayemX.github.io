var startupFileName = "StartUp";
var autosaveFileName = "AutoSave";
var clipboardFileName = "Clipboard";
var currentlyOpenedFile = null;

function Save(ask)
{
    var logoName;
    if (ask || !currentlyOpenedFile)
    {
        logoName = prompt("Save logo as: ");
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
        SetCurrentFile(logoName);
    }
    else
        logoName = currentlyOpenedFile;
    
	localStorage.setItem(logoName, JSON.stringify(currentProject.currentFile.lines));
	UpdateDropdown(logoName);
	Notify("File saved!");
}

function Open(logoName)
{
	var logo = localStorage.getItem(logoName);

	if (!logo)
	{
		Notify("Logo '" + logoName + "' doesn't exist!");
		return false;
	}

	var linesArray = JSON.parse(logo);

	currentProject.currentFile.lines = [];
	for (var i=0; i<linesArray.length; ++i)
	{
	    currentProject.currentFile.AddLine(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y
			)
		);
	}
 	
	savedfilesdropdown.selectedIndex = 0;
	savedfilesdropdown.blur();
    SetCurrentFile(logoName);
    Redraw();
    return true;
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
	var selectedLines = currentProject.currentFile.GetSelectedLines();
	sessionStorage.setItem(clipboardFileName, JSON.stringify(selectedLines));
	Notify("Lines copied to clipboard!");
}

function PasteLines()
{
	var logo = sessionStorage.getItem(clipboardFileName);
	if (!logo)
		return false;

	currentProject.currentFile.ClearSelection();

	var linesArray = JSON.parse(logo);

	for (var i=0; i<linesArray.length; ++i)
	{
	    currentProject.currentFile.AddLine(
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

	SetState(StateEnum.RENDERPREVIEW);
	Redraw();
	w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

	SetState(StateEnum.IDLE);
	Redraw();
	Notify("Picture saved!");
}

function SaveStartupFile()
{
	Notify("Startup file saved!");
	localStorage.setItem(startupFileName, JSON.stringify(lines));
}

// legacy not sure if needed
// still using lines[] instead of currentProject.currentFile.lines
/*
function LoadStartupFile()
{
	var logo = localStorage.getItem(startupFileName);
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
	Notify("Startup file loaded!");
    SetCurrentFile(null);
	Redraw();
	return true;	
}
//*/
function AutoSave()
{
    sessionStorage.setItem(autosaveFileName, JSON.stringify(currentProject.currentFile.lines));
}

function LoadAutoSave()
{
	var logo = sessionStorage.getItem(autosaveFileName);
	if (!logo)
		return false;

	currentProject.currentFile.lines = [];
	var linesArray = JSON.parse(logo);

	for (var i=0; i<linesArray.length; ++i)
	{
	    currentProject.currentFile.AddLine(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y
			)
		);
	}

    SetCurrentFile(null);
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
	firstEntry.textContent = "Load file:";
	firstEntry.value = "";
	savedfilesdropdown.appendChild(firstEntry)

	var selectedIndex = 0;
	for (var i=0; i<keys.length; ++i)
	{
		if (keys[i] == startupFileName)
			continue;

		var element = document.createElement("option");
		element.textContent = keys[i];
		element.value = keys[i];
		savedfilesdropdown.appendChild(element);

		if (keys[i] == lastAddedLogoName)
			selectedIndex = i + 1;
	}

 	savedfilesdropdown.selectedIndex = 0;
    // savedfilesdropdown.setAttribute("size", keys.length);
}

function DropDownSelected()
{
	Open(savedfilesdropdown.options[ savedfilesdropdown.selectedIndex ].value);
}

function NewFile()
{
	//if (confirm("Do you want to discard your LogoDesign and start from scratch?"))
    {
        // TODO use next line?? but then not sure if autosave
        // currentProject.AddFile(new File());
	    currentProject.currentFile.lines = [];
		AutoSave();
		SetCurrentFile(null);
		Redraw();
	}
}

function GenerateStartUpFile()
{
	Notify("Startup File Generated!");
	var startuplines = 
	[{"start":{"x":-8,"y":-3,"selected":false},"end":{"x":-8,"y":-1,"selected":false}},{"start":{"x":-8,"y":-1,"selected":false},"end":{"x":-7,"y":-1,"selected":false}},{"start":{"x":-6,"y":-2,"selected":false},"end":{"x":-6,"y":-1,"selected":false}},{"start":{"x":-6,"y":-1,"selected":false},"end":{"x":-5,"y":-1,"selected":false}},{"start":{"x":-5,"y":-1,"selected":false},"end":{"x":-5,"y":-2,"selected":false}},{"start":{"x":-5,"y":-2,"selected":false},"end":{"x":-6,"y":-2,"selected":false}},{"start":{"x":-4,"y":-2,"selected":false},"end":{"x":-4,"y":-1,"selected":false}},{"start":{"x":-4,"y":-1,"selected":false},"end":{"x":-3,"y":-1,"selected":false}},{"start":{"x":-3,"y":-1,"selected":false},"end":{"x":-3,"y":-2,"selected":false}},{"start":{"x":-3,"y":-2,"selected":false},"end":{"x":-4,"y":-2,"selected":false}},{"start":{"x":-3,"y":-1,"selected":false},"end":{"x":-3,"y":0,"selected":false}},{"start":{"x":-3,"y":0,"selected":false},"end":{"x":-4,"y":0,"selected":false}},{"start":{"x":-2,"y":-2,"selected":true},"end":{"x":-2,"y":-1,"selected":true}},{"start":{"x":-2,"y":-1,"selected":true},"end":{"x":-1,"y":-1,"selected":true}},{"start":{"x":-1,"y":-1,"selected":true},"end":{"x":-1,"y":-2,"selected":true}},{"start":{"x":-1,"y":-2,"selected":true},"end":{"x":-2,"y":-2,"selected":true}},{"start":{"x":-6,"y":0,"selected":false},"end":{"x":-6,"y":2,"selected":false}},{"start":{"x":-6,"y":2,"selected":false},"end":{"x":-5,"y":1,"selected":false}},{"start":{"x":-5,"y":1,"selected":false},"end":{"x":-6,"y":0,"selected":false}},{"start":{"x":5,"y":1,"selected":false},"end":{"x":5,"y":2,"selected":false}},{"start":{"x":5,"y":1,"selected":false},"end":{"x":6,"y":1,"selected":false}},{"start":{"x":5,"y":2,"selected":false},"end":{"x":6,"y":1,"selected":false}},{"start":{"x":5,"y":2,"selected":false},"end":{"x":6,"y":2,"selected":false}},{"start":{"x":-1,"y":1,"selected":false},"end":{"x":-2,"y":1,"selected":false}},{"start":{"x":-2,"y":1,"selected":false},"end":{"x":-1,"y":2,"selected":false}},{"start":{"x":-1,"y":2,"selected":false},"end":{"x":-2,"y":2,"selected":false}},{"start":{"x":0,"y":1,"selected":false},"end":{"x":0,"y":2,"selected":false}},{"start":{"x":1,"y":1,"selected":false},"end":{"x":1,"y":2,"selected":false}},{"start":{"x":1,"y":2,"selected":false},"end":{"x":2,"y":2,"selected":false}},{"start":{"x":2,"y":2,"selected":false},"end":{"x":2,"y":1,"selected":false}},{"start":{"x":2,"y":1,"selected":false},"end":{"x":1,"y":1,"selected":false}},{"start":{"x":2,"y":2,"selected":false},"end":{"x":2,"y":3,"selected":false}},{"start":{"x":2,"y":3,"selected":false},"end":{"x":1,"y":3,"selected":false}},{"start":{"x":3,"y":1,"selected":false},"end":{"x":3,"y":2,"selected":false}},{"start":{"x":3,"y":1,"selected":false},"end":{"x":4,"y":1,"selected":false}},{"start":{"x":4,"y":1,"selected":false},"end":{"x":4,"y":2,"selected":false}},{"start":{"x":-4,"y":1,"selected":false},"end":{"x":-4,"y":2,"selected":false}},{"start":{"x":-4,"y":1,"selected":false},"end":{"x":-3,"y":1,"selected":false}},{"start":{"x":-4,"y":2,"selected":false},"end":{"x":-3,"y":1,"selected":false}},{"start":{"x":-4,"y":2,"selected":false},"end":{"x":-3,"y":2,"selected":false}},{"start":{"x":7,"y":2,"selected":false},"end":{"x":7,"y":1,"selected":false}},{"start":{"x":7,"y":1,"selected":false},"end":{"x":8,"y":1,"selected":false}}]
	
	for (var i=0; i<startuplines.length; ++i)
	{
		lines.push(
			new Line(
				startuplines[i].start.x,
				startuplines[i].start.y,
				startuplines[i].end.x,
				startuplines[i].end.y
			)
		);
	}
}

function SetCurrentFile(fileName)
{
    currentlyOpenedFile = fileName;
    var text = "LogoDesigner";
    
    if (fileName)
        text += " - " + fileName
        
    document.title = text;
}

function SaveToDisk()
{
    var name = prompt("Save as: ");

    if (name) {
        var data = JSON.stringify(currentProject.currentFile.lines);
        var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name + ".json");
    }
}

var urlParameters = [];
function LoadURLParameters()
{
    var text = window.location.search.substring(1);
    var pairs = text.split('&');

    for (var pair of pairs)
    {
        var keyValuePair = pair.split('=');
        urlParameters[keyValuePair[0]] = keyValuePair[1];
    }
}