﻿class Point extends Vector2 {
    constructor (x, y, selected) { // TODO use default parameter
        //super(Math.round(x), Math.round(y));
        super(x, y);

        if (arguments.length == 3)
            this.selected = selected;
        else
            this.selected = false;
    }
    copy()
    {
        return new Point(this.x, this.y, this.selected);
    }
}