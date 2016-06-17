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

function Open36EncodedString(string36)
{
    if (!string36)
    {
        string36 = urlParameters["file"];
    }

    let numbers = [];
    for (let i = 0; i < string36.length; i+=2)
    {
        let currNumAsString = string36[i];
        currNumAsString += string36[i + 1];
        numbers.push(parseInt(currNumAsString, 36));
    }

    currentProject.currentFile.lines = [];

    let shift = Math.round(parseInt("zz", 36) / 2);

    for (var i = 0; i < numbers.length; ) {
        currentProject.currentFile.AddLine(
			new Line(
				numbers[i++] - shift,
				numbers[i++] - shift,
				numbers[i++] - shift,
				numbers[i++] - shift
			)
		);
    }
    Redraw();
}

function SaveAs36EncodedString()
{
    let lines = currentProject.currentFile.lines;
    let encodedString = "";

    let shift = Math.round(parseInt("zz", 36) / 2);

    for (let i = 0; i < lines.length; ++i) {
        encodedString += GetLeadingZeroEncodedString(lines[i].start.x + shift);
        encodedString += GetLeadingZeroEncodedString(lines[i].start.y + shift);
        encodedString += GetLeadingZeroEncodedString(lines[i].end.x + shift);
        encodedString += GetLeadingZeroEncodedString(lines[i].end.y + shift);
    }

    window.location.search = "file=" + encodedString;
}

function GetLeadingZeroEncodedString(value)
{
    let returnString = value.toString(36);

    if (returnString.length == 1)
        returnString = "0" + returnString;

    return returnString;
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
        window.location = window.location.pathname;
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
        SaveAsJSON(name);
    }
}

function SaveAsJSON(name)
{
    let data = JSON.stringify(currentProject.currentFile.lines);
    let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    saveAs(blob, name + ".json");
}

function ExportAsSVG()
{
    var name = prompt("Save as: ");

    if (name) {
        let svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';
        let factor = 10; // TODO maybe prompt for scale factor? or create own export-dialog-prompt-window?
        let linesArray = currentProject.currentFile.lines;

        let shiftX = 0;
        let shiftY = 0;

        for (let i = 0; i < linesArray.length; ++i)
        {
            shiftX = Math.min(shiftX, linesArray[i].start.x, linesArray[i].end.x);
            shiftY = Math.min(shiftY, linesArray[i].start.y, linesArray[i].end.y);
        }
        shiftX = -shiftX;
        shiftY = -shiftY;

        svgData += '\t<factor value="' + factor + '"/>\n';
        svgData += '\t<shift x="' + shiftX + '" y="' + shiftY + '"/>\n';

	    for (let i=0; i<linesArray.length; ++i)    
        {
	        svgData += 
                '\t<line ' + 
                'x1="'+ (shiftX + linesArray[i].start.x) * factor + '" ' + 
                'y1="' + (shiftY + linesArray[i].start.y) * factor + '" ' +
                'x2="' + (shiftX + linesArray[i].end.x) * factor + '" ' +
                'y2="' + (shiftY + linesArray[i].end.y) * factor + '" ' +
                'stroke="black" ' +
                'stroke-width="1"' +            
                '/> \n'
        }
        svgData += '</svg>';

        // var blob = new Blob([svgData], { type: "application/svg+xml" });
        let blob = new Blob([svgData], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name + ".svg");
    }
}

function LoadFromDisk()
{
    let logo = prompt("Paste json-file content here: ");
    if (logo)
    {
        GenerateLinesFromJSONString(logo);
    }
}
function GenerateLinesFromJSONString(jsonString)
{
    let linesArray = [];
    try {
        linesArray = JSON.parse(jsonString);
    }
    catch (err) {
        console.log(err);
        Notify("File type not supported!");
        return;
    }

    currentProject.currentFile.lines = [];
    for (var i = 0; i < linesArray.length; ++i) {
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

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    for (var i = 0, f; f = files[i]; i++) {
        
        let reader = new FileReader();
        let jsonString = reader.readAsText(files[i]);
        reader.onload = dndloaded;

    }
}

function dndloaded(evt)
{
    var jsonString = evt.target.result;
    GenerateLinesFromJSONString(jsonString);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}