"use strict"
class Saver {
    constructor() {
        console.log("Saver created. ");
    }

    saveAsFile() {
        console.log("Saver working. ");
    }

    saveToDisk()
    {
        var name = prompt("Save as: ");

        if (name) {
            this.saveAsJSON(name);
        }
    }

    saveAsJSON(name)
    {
        let data = JSON.stringify(DATA_MANAGER.currentFile.lines, null, '\t');

        let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name + ".json");
    }
}