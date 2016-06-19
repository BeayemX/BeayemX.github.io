"use strict"
class Saver {
    constructor() {
        console.log("Saver created. ");
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
        localStorage.setItem(autosaveFileName, JSON.stringify(DATA_MANAGER.currentFile));
        console.log("Saved.")
    }

    loadAutoSave() // TODO combine with loading from file
    {
        let autoSaveFile = localStorage.getItem(autosaveFileName);
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
}