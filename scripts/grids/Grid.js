class Grid
{
    constructor()
    {
        this.gridSize = 10;
        this.gridCellNumber = 32;
    }

    getNearestPointFor(p)
    {
        return new Vector2(this.adjustValue(p.x), this.adjustValue(p.y));
    }

    adjustValue(val)
    {
        val = val / this.gridSize;
        val = Math.round(val);
        val *= this.gridSize;

        let limit = this.gridCellNumber * this.gridSize * 0.5;
        val = Math.min(Math.max(val, -limit), limit);

        return val;
    }

    drawGrid()
    {
        let size = this.gridCellNumber * 0.5;

        let color;
        let thickness;

        for (let i = -size; i <= size; ++i) {
            if (i % SETTINGS.bigGridSize == 0) {
                thickness = 2;
                color = SETTINGS.gridBigLineColor;

            }
            else if (Math.round(i % (SETTINGS.bigGridSize * 0.5) == 0)) {
                thickness = 2;
                color = SETTINGS.gridLineColor;
            }
            else {
                thickness = 1;
                color = SETTINGS.gridLineColor;
            }

            DRAW_MANAGER.drawLineFromTo(
                new Point(
                    -size * this.gridSize,
                    i * this.gridSize
                ),
                new Point(
                    size * this.gridSize,
                    i * this.gridSize
                ),
                thickness,
                color,
                false,
                true
            );
            DRAW_MANAGER.drawLineFromTo(
                new Point(
                    i * this.gridSize,
                    -size * this.gridSize
                ),
                new Point(
                    i * this.gridSize,
                    size * this.gridSize
                ),
                thickness,
                color,
                false,
                true
            );
        }
    }
}