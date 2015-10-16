var StateEnum = {
	IDLE: 1,
	DRAWING: 2, 
	GRABBING: 3,
	RENDERPREVIEW: 4,
	PANNING: 5
}

function Line(x1, y1, x2, y2, selected)
{
	this.start = new GridPoint(x1, y1);
	this.end = new GridPoint(x2, y2);

	if (arguments.length == 5)
	{
		this.start.selected = selected;
		this.end.selected = selected;
	}
	
	this.SelectedPoints = function()
	{
		if (this.start.selected && this.end.selected) return 2;
		else if (this.start.selected || this.end.selected) return 1;
		else return 0;
	};
}
function GridPoint(x, y)
{
	this.x = x;
	this.y = y;
	this.selected = false;

	this.select = function()
	{
		this.selected = true;
	}
}