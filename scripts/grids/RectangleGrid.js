class RectangleGrid {
    constructor() {
        this.gridSize = 10;
        this.gridCellNumber = 32;
        
        this.gridLineColor = '#444';

        this.bigGridSize = 8;
        this.gridBigLineColor = '#333';

        this.thickness = 0.33;
        this.bigGridThickness = this.thickness * 2;

        //this.dashSize = 1;
        //this.dashSpaceSize = 1;
    }

    getNearestPointFor(p) {
        return new Vector2(this.adjustValue(p.x), this.adjustValue(p.y));
    }

    adjustValue(val) {
        val = val / this.gridSize;
        val = Math.round(val);
        val *= this.gridSize;
        return val;
    }

    drawGrid() {
        let size = this.gridCellNumber * 0.5;
        let color;
        let thickness;

        //context.setLineDash([this.dashSize * Camera.zoom, this.dashSpaceSize * Camera.zoom]);

        for (let i = -size; i <= size; i += this.bigGridSize) {
            Renderer.batchLine(new Line(new Vector2(-size * this.gridSize, i * this.gridSize), new Vector2(size * this.gridSize, i * this.gridSize)), true);
            Renderer.batchLine(new Line(new Vector2(i * this.gridSize, -size * this.gridSize), new Vector2(i * this.gridSize, size * this.gridSize)), true);
        }
        Renderer.renderBatchedLines(this.bigGridThickness, this.gridBigLineColor, false, true);

        for (let i = -size; i <= size; i += this.bigGridSize * 0.5) {
            if (Math.round(i % (this.bigGridSize) == 0))
                continue;
            Renderer.batchLine(new Line(new Vector2(-size * this.gridSize, i * this.gridSize), new Vector2(size * this.gridSize, i * this.gridSize)), true);
            Renderer.batchLine(new Line(new Vector2(i * this.gridSize, -size * this.gridSize), new Vector2(i * this.gridSize, size * this.gridSize)), true);
        }
        Renderer.renderBatchedLines(this.bigGridThickness, this.gridLineColor, false, true);

        for (let i = -size; i <= size; ++i) {
            if (Math.round(i % (this.bigGridSize * 0.5) == 0))
                continue;
            Renderer.batchLine(new Line(new Vector2(-size * this.gridSize, i * this.gridSize), new Vector2(size * this.gridSize, i * this.gridSize)), true);
            Renderer.batchLine(new Line(new Vector2(i * this.gridSize, -size * this.gridSize), new Vector2(i * this.gridSize, size * this.gridSize)), true);
        }
        Renderer.renderBatchedLines(this.thickness, this.gridLineColor, false, true);

        //context.setLineDash([]);
    }
}