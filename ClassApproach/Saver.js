"use strict"
class Saver {
    constructor() {
        console.log("Saver created. ");

        this.autosaveFileName = "AutoSave";
        this.clipboardFileName = "Clipboard";
    }

    saveToDisk()
    {
        var name = prompt("Save as: ");

        if (name) {
            this.saveAsJSON(name);
        }
    }

    // TODO create method in file-class which creates object where only the important information is saved and save that as json
    saveAsJSON(name)
    {
        let data = JSON.stringify(DATA_MANAGER.currentFile.lineObjects, null, '\t');

        let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name + ".json");
    }
    
    loadJSONFile(jsonString)
    {
        let file;
        try {
            file = JSON.parse(jsonString);
        }
        catch (err) {
            console.log(err);
            GUI.notify("File type not supported!");
            return;
        }

        DATA_MANAGER.currentFile = new File();

        let objs = file;

        for (var i = 0; i < objs.length; ++i) {
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

        DRAW_MANAGER.redraw();
        return;
    }

    
    autoSave()
    {
        localStorage.setItem(this.autosaveFileName, JSON.stringify(DATA_MANAGER.currentFile));
        console.log("Saved.")
    }

    loadAutoSave() // TODO combine with loading from file
    {
        let autoSaveFile = localStorage.getItem(this.autosaveFileName);
        if (!autoSaveFile)
            return;

        DATA_MANAGER.currentFile.lineObjects = [];
        let file = JSON.parse(autoSaveFile);
        let objs = file.lineObjects;

        for (var i = 0; i < objs.length; ++i) {
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

        DRAW_MANAGER.redraw();
    }


    newFile() {
        DATA_MANAGER.currentFile = new File();
        DATA_MANAGER.currentFile.currentObject = DATA_MANAGER.currentFile.addObject();
        DRAW_MANAGER.redraw();
    }

    copyLinesToClipboard() // session storage
    {
        let selectedLines = DATA_MANAGER.currentFile.getSelectedLines();
        sessionStorage.setItem(this.clipboardFileName, JSON.stringify(selectedLines));
        GUI.notify("Lines copied to clipboard!");
    }

    pasteLines() // session storage
    {
        let logo = sessionStorage.getItem(this.clipboardFileName);
        if (!logo)
            return false;

        DATA_MANAGER.currentFile.clearSelection();

        let linesArray = JSON.parse(logo);

        for (var i = 0; i < linesArray.length; ++i) {
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
    
    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    dndloaded(evt) {
        var jsonString = evt.target.result;

        console.log("loaded: \n" + jsonString);
        this.loadJSONFile(jsonString);
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        for (var i = 0, f; f = files[i]; i++) {

            let reader = new FileReader();
            let jsonString = reader.readAsText(files[i]);
            reader.onload = (evt) => SAVER.dndloaded(evt);
        }
    }
}