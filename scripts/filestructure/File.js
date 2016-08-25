class File {
    static init() {
        console.log("File created.");
        this.layers = [];
        this.currentLayer = null;
    }

    static createNewLayer(selectNewLayer) {
        let layer = new Layer();
        this.layers.push(layer);

        if (selectNewLayer)
            this.selectLayerWithID(this.layers.length - 1);

        GUI.objectHierarchyChanged();

        return layer;
    }

    static deleteLayerWithID(id) {
        if (id < 0 || id >= this.layers.length)
            return;

        if (this.currentLayer)
            Selection.clearSelection();

        this.selectNextVisibleLayer(id);
        Utilities.deleteArrayEntry(this.layers, this.layers[id]);

        GUI.objectHierarchyChanged();
        Renderer.redraw();
    }

    static selectLayerWithID(id) {
        if (id < 0 || id >= this.layers.length)
            return;

        if (this.currentLayer)
            Selection.clearSelection();

        this.currentLayer = this.layers[id];
        this.layers[id].visible = true;

        GUI.objectHierarchyChanged();
        Renderer.redraw();
    }

    static toggleVisibilityOfLayerWithID(id) {
        if (this.currentLayer)
            Selection.clearSelection();

        this.layers[id].visible = !this.layers[id].visible;

        if (!this.layers[id].visible) {
            this.selectNextVisibleLayer(id);
        }

        GUI.objectHierarchyChanged();
        Renderer.redraw();
    }

    static selectNextVisibleLayer(id) {
        if (this.currentLayer == this.layers[id]) {
            if (this.layers.length == 1) {
                this.createNewLayer(true);
                GUI.notify("No layer available. New layer has been created.");
            }
            else {
                let i = 1;
                let upperOut = false;
                let lowerOut = false;
                while (i <= this.layers.length) {

                    if (id + i < this.layers.length) {
                        if (this.layers[id + i].visible) {
                            this.currentLayer = this.layers[id + i];
                            break;
                        }

                    }
                    else
                        upperOut = true;

                    if (id - i >= 0) {
                        if (this.layers[id - i].visible) {
                            this.currentLayer = this.layers[id - i];
                            break;
                        }
                    }
                    else
                        lowerOut = true;


                    if (upperOut && lowerOut) {
                        this.createNewLayer(true);
                        GUI.notify("No layer available. New layer has been created.");
                        break;
                    }
                    ++i;
                }
            }
        }
    }

    static renameLayerWithID(id) {
        let name = prompt("New name for layer: ");

        if (name) {
            this.layers[id].name = name;
        }
        GUI.objectHierarchyChanged();
    }

    static changeNameForLayerWithID(id, name) {
        this.layers[id].name = name;
    }

    static updateStats() {
        let amountLines = 0;
        for (var i = 0; i < this.layers.length; i++)
            amountLines += this.layers[i].lines.length;

        amountLines += Selection.lines.length + Selection.partialLines.length;
        GUI.writeToStats("Lines in File", amountLines);
    }

    static addLine(line, select) {
        if (!this.currentLayer) {
            console.log("There was no layer, so there has been created one.");
            this.createNewLayer(true);
        }
        if (select)
            Selection.addLine(line);
        else
            this.currentLayer.addLine(line);

        this.updateStats();
    }

    // SIFU FIXME all duplicates of current object. just poltergeisting...
    static getAllPointsAt(point, cursorRange) {
        return this.currentLayer.getAllPointsAt(point, cursorRange);
    }

    static cleanUpFile() {
        this.currentLayer.cleanUpFile();
    }

    static selectAllToggle() {
        this.currentLayer.selectAllToggle();
    }
    static duplicateLines() {
        this.currentLayer.duplicateLines();
    }
    static growSelection(redraw) {
        this.currentLayer.growSelection(redraw);
    }
    static selectLinked() {
        this.currentLayer.selectLinked();
    }
    static removeLine(line) {
        this.currentLayer.removeLine(line);
    }
}