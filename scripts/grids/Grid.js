class Grid {
    constructor() {
        this.gridSize = 10;
        this.gridCellNumber = 32;

        this.gridLineColor = '#444';

        this.bigGridSize = 8;
        this.gridBigLineColor = '#333';
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

        for (let i = -size; i <= size; i += this.bigGridSize) {
            DRAW_MANAGER.batchLine(new Line(new Point(-size * this.gridSize, i * this.gridSize), new Point(size * this.gridSize, i * this.gridSize)), true);
            DRAW_MANAGER.batchLine(new Line(new Point(i * this.gridSize, -size * this.gridSize), new Point(i * this.gridSize, size * this.gridSize)), true);
        }
        DRAW_MANAGER.renderBatchedLines(2, this.gridBigLineColor, false, true);

        for (let i = -size; i <= size; i += this.bigGridSize * 0.5) {
            if (Math.round(i % (this.bigGridSize) == 0))
                continue;
            DRAW_MANAGER.batchLine(new Line(new Point(-size * this.gridSize, i * this.gridSize), new Point(size * this.gridSize, i * this.gridSize)), true);
            DRAW_MANAGER.batchLine(new Line(new Point(i * this.gridSize, -size * this.gridSize), new Point(i * this.gridSize, size * this.gridSize)), true);
        }
        DRAW_MANAGER.renderBatchedLines(2, this.gridLineColor, false, true);

        for (let i = -size; i <= size; ++i) {
            if (Math.round(i % (this.bigGridSize * 0.5) == 0))
                continue;
            DRAW_MANAGER.batchLine(new Line(new Point(-size * this.gridSize, i * this.gridSize), new Point(size * this.gridSize, i * this.gridSize)), true);
            DRAW_MANAGER.batchLine(new Line(new Point(i * this.gridSize, -size * this.gridSize), new Point(i * this.gridSize, size * this.gridSize)), true);
        }
        DRAW_MANAGER.renderBatchedLines(1, this.gridLineColor, false, true);
    }
}