class GridManager {

    constructor() {
        console.log("GridManager created.");

        //this.grid = new TriangleGrid();
        this.grid = new RectangleGrid();
    }

    toggleGrid() {
        if (this.grid instanceof RectangleGrid)
            this.grid = new TriangleGrid();
        else
            this.grid = new RectangleGrid();

        GUI.genereateGridSettings();
        RENDERER.redraw();
    }
}