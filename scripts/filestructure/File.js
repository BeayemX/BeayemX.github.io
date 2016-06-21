"use strict"
class File {
    constructor() {
        this.lineObjects = [];
        this.deletedLinesCounter = 0;
        this.currentObject = null;
    }

    createNewObject(selectNewObject) {
        let obj = new LineObject();
        this.lineObjects.push(obj);

        if (selectNewObject)
            this.selectObjectWithID(this.lineObjects.length-1);

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

    updateStats() // TODO use this?
    {

    }

    addLine(line) {
        this.currentObject.addLine(line);
    }

    clearSelection() {
        for (var i = 0; i < this.lineObjects.length; i++) {
            this.lineObjects[i].clearSelection();
        }
    }
    // SIFU FIXME all duplicates of current object. just poltergeisting...
    getPreciseSelectionEntries() {
        return this.currentObject.getPreciseSelectionEntries();
    }

    getAllPointsAt(point) {
        return this.currentObject.getAllPointsAt(point);
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