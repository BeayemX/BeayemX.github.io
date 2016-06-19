class PrecisePoint extends Vector2 {
    constructor (x, y, selected, point)
    {
        super(x, y);
        this.selected = selected;
        this.point = point;
    }
}