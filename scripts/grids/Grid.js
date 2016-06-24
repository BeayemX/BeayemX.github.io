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
        return val;
    }
}