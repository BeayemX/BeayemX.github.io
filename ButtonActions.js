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