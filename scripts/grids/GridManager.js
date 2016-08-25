class GridManager {

    static init() {
        console.log("GridManager created.");

        //this.grid = new TriangleGrid();
        this.grid = new RectangleGrid();
    }

    static toggleGrid() {
        if (this.grid instanceof RectangleGrid)
            this.grid = new TriangleGrid();
        else
            this.grid = new RectangleGrid();

        GUI.genereateGridSettings();
        Renderer.redraw();
    }
}