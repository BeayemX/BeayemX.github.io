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
            this.currentLayer.clearSelection();

        this.currentLayer = this.layers[id];
        DRAW_MANAGER.redraw();
    }

    updateStats() {
        this.currentLayer.updateStats();

        let amountLines = 0;
        for (var i = 0; i < this.layers.length; i++)
            amountLines += this.layers[i].lines.length;
        GUI.writeToStats("Lines", amountLines);
    }

    addLine(line) {
        if (!this.currentLayer) {
            console.log("There was no layer, so there has been created one.");
            this.createNewLayer(true);
        }
        this.currentLayer.addLine(line);
    }

    clearSelection() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].clearSelection();
        }
    }
    // SIFU FIXME all duplicates of current object. just poltergeisting...
    getAllPointsAt(point, cursorRange) {
        return this.currentLayer.getAllPointsAt(point, cursorRange);
    }

    getAllSelectedPoints() {
        return this.currentLayer.getAllSelectedPoints();
    }

    cleanUpFile() {
        this.currentLayer.cleanUpFile();
    }

    isSomethingSelected() {
        return this.currentLayer.isSomethingSelected()
    }

    selectAllToggle() {
        this.currentLayer.selectAllToggle();
    }
    duplicateLines() {
        this.currentLayer.duplicateLines();
    }
    getSelectedLines() {
        return this.currentLayer.getSelectedLines();
    }
    deleteSelectedLines() {
        this.currentLayer.deleteSelectedLines();
    }
    getAllPoints() {
        return this.currentLayer.getAllPoints();
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
    invertSelection() {
        this.currentLayer.invertSelection();
    }
}