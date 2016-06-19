class GridPoint extends Vector2 {
    constructor (x, y, selected) { // TODO use default parameter
        super(x, y);
        if (arguments.length == 3)
            this.selected = selected;
        else
            this.selected = false;
    }
    Copy()
    {
        return new GridPoint(this.x, this.y, this.selected);
    }
}