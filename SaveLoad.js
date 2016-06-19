"use strict";

var autosaveFileName = "AutoSave";
var clipboardFileName = "Clipboard";
var currentlyOpenedFile = null;

/*
function Save(ask) // local storage
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
    
	localStorage.setItem(logoName, JSON.stringify(DATA_MANAGER.currentFile.lines));
	UpdateDropdown(logoName);
	Notify("File saved!");
}//*/
/*
function Open(logoName) // local storage
{
	var logo = localStorage.getItem(logoName);

	if (!logo)
	{
		GUI.notify("Logo '" + logoName + "' doesn't exist!");
		return false;
	}

	var linesArray = JSON.parse(logo);

	DATA_MANAGER.currentFile.lines = [];
	for (var i=0; i<linesArray.length; ++i)
	{
	    DATA_MANAGER.currentFile.addLine(
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
    DRAW_MANAGER.redraw();
    return true;
}

function Open36EncodedString(string36) // url
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

    DATA_MANAGER.currentFile.lines = [];

    let shift = Math.round(parseInt("zz", 36) / 2);

    for (var i = 0; i < numbers.length; ) {
        DATA_MANAGER.currentFile.addLine(
			new Line(
				numbers[i++] - shift,
				numbers[i++] - shift,
				numbers[i++] - shift,
				numbers[i++] - shift
			)
		);
    }
    DRAW_MANAGER.redraw();
}

/*
function SaveAs36EncodedString() // url
{
    let lines = DATA_MANAGER.currentFile.lines;
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

function GetLeadingZeroEncodedString(value)  // url
{
    let returnString = value.toString(36);

    if (returnString.length == 1)
        returnString = "0" + returnString;

    return returnString;
}
function DeleteSavedLogo(logoName) // localstorage
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
*/

function CopyLinesToClipboard() // session storage
{
	var selectedLines = DATA_MANAGER.currentFile.getSelectedLines();
	sessionStorage.setItem(clipboardFileName, JSON.stringify(selectedLines));
	GUI.notify("Lines copied to clipboard!");
}

function PasteLines() // session storage
{
	var logo = sessionStorage.getItem(clipboardFileName);
	if (!logo)
		return false;

	DATA_MANAGER.currentFile.clearSelection();

	var linesArray = JSON.parse(logo);

	for (var i=0; i<linesArray.length; ++i)
	{
	    DATA_MANAGER.currentFile.addLine(
			new Line(
				linesArray[i].start.x,
				linesArray[i].start.y,
				linesArray[i].end.x,
				linesArray[i].end.y, 
				true
			)
		);
	}
	GUI.notify("Lines pasted from clipboard!");
	DRAW_MANAGER.redraw();
	return true;
}

function TakeScreenshot() // img
{
	var w=window.open('about:blank','image from canvas');
	// also save blueprint
	//w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

	LOGIC.setState(StateEnum.RENDERPREVIEW);
	DRAW_MANAGER.redraw();
	w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

	LOGIC.setState(StateEnum.IDLE);
	DRAW_MANAGER.redraw();
	GUI.notify("Picture saved!");
}

function AutoSave() // session storage
{
    localStorage.setItem(autosaveFileName, JSON.stringify(DATA_MANAGER.currentFile));
    console.log("Saved.")
}

function LoadAutoSave() // session storage
{
	let autoSaveFile = localStorage.getItem(autosaveFileName);
	if (!autoSaveFile)
		return;

	DATA_MANAGER.currentFile.lineObjects = [];
	let file = JSON.parse(autoSaveFile);
	let objs = file.lineObjects;

	for (var i = 0; i < objs.length; ++i)
	{
	    DATA_MANAGER.currentFile.currentObject = DATA_MANAGER.currentFile.addObject();

	    for (var j = 0; j < objs[i].lines.length; j++) {
	        DATA_MANAGER.currentFile.currentObject.addLine(
                new Line(
                    objs[i].lines[j].start.x,
                    objs[i].lines[j].start.y,
                    objs[i].lines[j].end.x,
                    objs[i].lines[j].end.y
                )
            );
	    }
	}

    // SetCurrentFile(null);
	DRAW_MANAGER.redraw();
}

/*function UpdateDropdown(lastAddedLogoName) // local storage
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

function DropDownSelected() // local storage
{
	Open(savedfilesdropdown.options[ savedfilesdropdown.selectedIndex ].value);
}
*/

function NewFile() // TOOD USE ME
{
	//if (confirm("Do you want to discard your LogoDesign and start from scratch?"))
    {
        DATA_MANAGER.currentFile = new File();
        DATA_MANAGER.currentFile.currentObject = DATA_MANAGER.currentFile.addObject();
		DRAW_MANAGER.redraw();
	}
}

/*
function SetCurrentFile(fileName) // TAB NAME
{
    currentlyOpenedFile = fileName;
    var text = "LogoDesigner";
    
    if (fileName)
        text += " - " + fileName
        
    document.title = text;
}
*/


function ExportAsSVG() // SVG
{
    var name = prompt("Save as: ");

    if (name) {
        let svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';
        let factor = 10; // TODO maybe prompt for scale factor? or create own export-dialog-prompt-window?
        let linesArray = DATA_MANAGER.currentFile.lines;

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

/*
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
*/
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
    console.log(jsonString);
    saver.loadJSONFile(jsonString);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}