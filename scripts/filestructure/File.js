class File {
    constructor() {
        console.log("File created.");
        this.layers = [];
        this.currentLayer = null;
    }

    createNewLayer(selectNewLayer) {
        let layer = new Layer();
        this.layers.push(layer);

        if (selectNewLayer)
            this.selectLayerWithID(this.layers.length - 1);

        GUI.objectHierarchyChanged();

        return layer;
    }

    deleteLayerWithID(id) {
        if (id < 0 || id >= this.layers.length)
            return;

        if (this.currentLayer)
            SELECTION.clearSelection();

        let wasCurrentLayer = this.currentLayer == this.layers[id];

        UTILITIES.deleteArrayEntry(this.layers, this.layers[id]);

        if (wasCurrentLayer) {
            if (this.layers.length == 0)
                this.createNewLayer(true);
            else {
                if (id < this.layers.length)
                    this.currentLayer = this.layers[id];
                else
                    this.currentLayer = this.layers[id - 1];
            }
        }

        GUI.objectHierarchyChanged();
        DRAW_MANAGER.redraw();
    }

    selectLayerWithID(id) {
        if (id < 0 || id >= this.layers.length)
            return;

        if (this.currentLayer)
            SELECTION.clearSelection();

        this.currentLayer = this.layers[id];
        this.layers[id].visible = true;

        GUI.objectHierarchyChanged();
        DRAW_MANAGER.redraw();
    }

    toggleVisibilityOfLayerWithID(id) {
        if (this.currentLayer)
            SELECTION.clearSelection();

        this.layers[id].visible = !this.layers[id].visible;

        if (!this.layers[id].visible) {
            if (this.currentLayer == this.layers[id]) {

                if (this.layers.length == 1)
                    this.createNewLayer(true);
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
                        else {
                            upperOut = true;
                            console.log("upperOut " + (id + i));
                        }

                        if (id - i >= 0) {
                            if (this.layers[id - i].visible) {
                                this.currentLayer = this.layers[id - i];
                                break;
                            }
                        }
                        else {
                            lowerOut = true;
                            console.log("lowerOut " + (id + i));
                        }


                        if (upperOut && lowerOut) {
                            this.createNewLayer(true);
                            console.log("shoud create new layer")
                            break;
                        }
                        ++i;
                    }
                }



            }
        }

        GUI.objectHierarchyChanged();
        DRAW_MANAGER.redraw();
    }

    updateStats() {
        let amountLines = 0;
        for (var i = 0; i < this.layers.length; i++)
            amountLines += this.layers[i].lines.length;

        amountLines += SELECTION.lines.length + SELECTION.partialLines.length;
        GUI.writeToStats("Lines in File", amountLines);
    }

    addLine(line, select) {
        if (!this.currentLayer) {
            console.log("There was no layer, so there has been created one.");
            this.createNewLayer(true);
        }
        if (select)
            SELECTION.addLine(line);
        else
            this.currentLayer.addLine(line);

        this.updateStats();
    }

    // SIFU FIXME all duplicates of current object. just poltergeisting...
    getAllPointsAt(point, cursorRange) {
        return this.currentLayer.getAllPointsAt(point, cursorRange);
    }

    cleanUpFile() {
        this.currentLayer.cleanUpFile();
    }

    selectAllToggle() {
        this.currentLayer.selectAllToggle();
    }
    duplicateLines() {
        this.currentLayer.duplicateLines();
    }
    growSelection(redraw) {
        this.currentLayer.growSelection(redraw);
    }
    selectLinked() {
        this.currentLayer.selectLinked();
    }
    removeLine(line) {
        this.currentLayer.removeLine(line);
    }
}