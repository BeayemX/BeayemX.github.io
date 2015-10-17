function Button1()
{
	console.log("button pressed");
}

function Subdivide()
{
	var selectedLines = GetSelectedLines();
	for (var i=0; i<selectedLines.length; ++i)
	{
		var midPoint = 
		{
			x: Math.round((selectedLines[i].end.x + selectedLines[i].start.x) / 2),
			y: Math.round((selectedLines[i].end.y + selectedLines[i].start.y) / 2)
		}
		lines.push(new Line(selectedLines[i].start.x, selectedLines[i].start.y, midPoint.x, midPoint.y, true));
		lines.push(new Line(midPoint.x, midPoint.y, selectedLines[i].end.x, selectedLines[i].end.y, true));
		DeleteArrayEntry(lines, selectedLines[i]);
	}
	CheckForCrapLines();
	Redraw();
}

function Mirror()
{
	var minX = Infinity
	var maxX = -Infinity
	var selLines = GetSelectedLines();

	for (var i=0; i<selLines.length; ++i)
	{
		minX = Math.min(minX, selLines[i].start.x);
		maxX = Math.max(maxX, selLines[i].start.x);

		minX = Math.min(minX, selLines[i].end.x);
		maxX = Math.max(maxX, selLines[i].end.x);
	}
	
	for (var i=0; i<selLines.length; ++i)
	{
		selLines[i].start.x -= (selLines[i].start.x - minX) * 2 - (maxX-minX);
		selLines[i].end.x -= (selLines[i].end.x - minX) * 2 - (maxX-minX);
	}
	Redraw();
}