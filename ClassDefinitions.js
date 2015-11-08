"use strict";

var StateEnum = {
	IDLE: "idle",
	DRAWING: "drawing", 
	GRABBING: "grabbing",
	RENDERPREVIEW: "renderpreview",
	BORDERSELECTION: "borderselection"
}

var isPanning = false;

class Line
{
    constructor(x1, y1, x2, y2, selected)
    {
	    this.start = new GridPoint(x1, y1);
	    this.end = new GridPoint(x2, y2);
	    
	    if (arguments.length == 5)
	    {
	        this.start.selected = selected;
	        this.end.selected = selected;
	    }
    }
	
	get SelectedPoints()
	{
		if (this.start.selected && this.end.selected) return 2;
		else if (this.start.selected || this.end.selected) return 1;
		else return 0;
	}
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Copy() {
        return new Vector2(this.x, this.y);
    }

    Add(value) {
        this.x += value;
        this.y += value;
    }

    Subtract(value)
    {
        this.Add(-value);
    }

    Multiply(value) {
        this.x *= value;
        this.y *= value;
    }

    Divide(value) {
        this.Multiply(1 / value);
    }
}

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



