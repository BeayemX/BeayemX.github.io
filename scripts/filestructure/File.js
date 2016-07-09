﻿class File {
    constructor() {
        this.lineObjects = [];
        this.currentObject = null;
    }

    createNewObject(selectNewObject) {
        let obj = new LineObject();
        this.lineObjects.push(obj);

        if (selectNewObject)
            this.selectObjectWithID(this.lineObjects.length - 1);

        GUI.objectHierarchyChanged();

        return obj;
    }

    selectObjectWithID(id) {
        if (id < 0 || id >= this.lineObjects.length)
            return;

        if (this.currentObject)
            this.currentObject.clearSelection();

        this.currentObject = this.lineObjects[id];
        DRAW_MANAGER.redraw();
    }

    updateStats() {
        this.currentObject.updateStats();

        let amountLines = 0;
        for (var i = 0; i < this.lineObjects.length; i++)
            amountLines += this.lineObjects[i].lines.length;
        GUI.writeToStats("Lines", amountLines);
    }

    addLine(line) {
        if (!this.currentObject) {
            console.log("There was no layer, so there has been created one.");
            this.createNewObject(true);
        }
        this.currentObject.addLine(line);
    }

    clearSelection() {
        for (var i = 0; i < this.lineObjects.length; i++) {
            this.lineObjects[i].clearSelection();
        }
    }
    // SIFU FIXME all duplicates of current object. just poltergeisting...
    getAllPointsAt(point, cursorRange) {
        return this.currentObject.getAllPointsAt(point, cursorRange);
    }

    getAllSelectedPoints() {
        return this.currentObject.getAllSelectedPoints();
    }

    cleanUpFile() {
        this.currentObject.cleanUpFile();
    }

    isSomethingSelected() {
        return this.currentObject.isSomethingSelected()
    }

    selectAllToggle() {
        this.currentObject.selectAllToggle();
    }
    duplicateLines() {
        this.currentObject.duplicateLines();
    }
    getSelectedLines() {
        return this.currentObject.getSelectedLines();
    }
    deleteSelectedLines() {
        this.currentObject.deleteSelectedLines();
    }
    getAllPoints() {
        return this.currentObject.getAllPoints();
    }
    growSelection(redraw) {
        this.currentObject.growSelection(redraw);
    }
    selectLinked() {
        this.currentObject.selectLinked();
    }
    removeLine(line) {
        this.currentObject.removeLine(line);
    }
    invertSelection() {
        this.currentObject.invertSelection();
    }
}