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