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
}