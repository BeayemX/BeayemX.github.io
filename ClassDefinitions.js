"use strict";

var StateEnum = {
	IDLE: "idle",
	DRAWING: "drawing", 
	GRABBING: "grabbing",
	RENDERPREVIEW: "renderpreview",
	BORDERSELECTION: "borderselection"
}

// SIFU put inside class which makes sense
var isPanning = false;

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

class PrecisePoint extends Vector2 {
    constructor (x, y, selected, point)
    {
        super(x, y);
        this.selected = selected;
        this.point = point;
    }
}