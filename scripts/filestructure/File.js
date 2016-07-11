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

    selectLayerWithID(id) {
        if (id < 0 || id >= this.layers.length)
            return;

        if (this.currentLayer)
            SELECTION.clearSelection();

        this.currentLayer = this.layers[id];
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