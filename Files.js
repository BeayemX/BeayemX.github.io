"use strict"
class Project
{
    constructor()
    {
        this.files = [];
        this.AddFile(new File());
        this.currentFileIndex = 0;
    }

    AddFile(file)
    {
        this.files.push(file);
        this.currentFileIndex = this.files.length - 1;
    }

    get currentFile()
    {
        return this.files[this.currentFileIndex];
    }
}

class File
{
    constructor()
    {
        this.lines = [];
        this.deletedLinesCounter = 0;
    }

    AddLine(line)
    {
        this.lines.push(line);
        this.CleanUpFile();
        this.UpdateStats();
    }
    
    AddLines(duplLines)
    {
        this.lines = this.lines.concat(duplLines);
        this.CleanUpFile();
        this.UpdateStats();
    }

    RemoveLine(line)
    {

        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i] == line) 
                this.lines.splice(i, 1);
        }

        // CleanUpFile();
        this.UpdateStats();
    }

    CleanUpFile()
    {
        // lines with length 0
        for (var i=0; i<this.lines.length; ++i)
        {
            if (this.lines[i].start.x == this.lines[i].end.x
                && this.lines[i].start.y == this.lines[i].end.y)
                this.RemoveLine(this.lines[i]);
        }

        // overlapping lines
        this.deletedLinesCounter = 0;
        for (var i = this.lines.length - 1; i >= 0; --i)
        {
            for (var j = this.lines.length - 1; j > i; --j)
            {
                if (this.lines[i].SelectedPoints == 0 &&
                    this.lines[j].SelectedPoints == 0 &&
                    this.LinesOverlapping(this.lines[i], this.lines[j]))
                {
                    this.RemoveLine(this.lines[j]);
                    ++this.deletedLinesCounter;
                    continue;
                }
            }
        }
        this.UpdateStats();
    }

    UpdateStats()
    {
        var text = this.lines.length + " lines";

        if (this.deletedLinesCounter > 0) {
            // Redraw(); // TODO not sure if needed
            text += " (" + this.deletedLinesCounter + " cleaned up)";
        }

        WriteToStatusbarRight(text);
    }

    GetAllSelectedPoints()
    {
        var points = [];
	
        for (var i=0; i<this.lines.length; ++i)
        {
            if (this.lines[i].start.selected)
                points.push(this.lines[i].start);
            if (this.lines[i].end.selected)
                points.push(this.lines[i].end);
        }

        return points;
    }

    
    GetUnselectedLines()
    {
        var points = this.GetAllSelectedPoints();
        var selectedLines = [];
        for (var i = 0; i < this.lines.length; ++i) {
            if (this.lines[i].start.selected == false && this.lines[i].end.selected == false)
                selectedLines.push(this.lines[i]);
        }
        return selectedLines;
    }

    
    GetSelectedLines()
    {
        var points = this.GetAllSelectedPoints();
        var selectedLines = [];
        for (var i=0; i<this.lines.length; ++i)
        {
            if (this.lines[i].start.selected || this.lines[i].end.selected)
                selectedLines.push(this.lines[i]);
        }
        return selectedLines;
    }

    
    GetAllPointsAt(gridpoint)
    {
        var points = [];
        for (var i=0; i<this.lines.length; ++i)
        {
            if (this.lines[i].start.x == gridpoint.x && this.lines[i].start.y == gridpoint.y)
                points.push(this.lines[i].start);
            else if (this.lines[i].end.x == gridpoint.x && this.lines[i].end.y == gridpoint.y)
                points.push(this.lines[i].end);
        }
        return points;
    }

    GetPreciseSelectionEntries()
    {
        var points = this.GetAllPointsAt(currentGridPosition);
        var screenPos = GridpointToScreenpoint(currentGridPosition);
        var precisePoints = [screenPos];

        if (points.length <= 1 || !showAdvancedHandles)
            return precisePoints

        for (var i=0; i<points.length; ++i)
        {
            var otherPoint = this.GetOtherPointBelongingToLine(points[i]);
            var direction = new Vector2(
                otherPoint.x - points[i].x,
                otherPoint.y - points[i].y);

            direction.Normalize();

            var preciseRadius = gridSize * 0.5 - gridPointSize * 2;
            var precisePoint = new PrecisePoint(
                screenPos.x + direction.x * preciseRadius, 
                screenPos.y + direction.y * preciseRadius,
                points[i].selected,
                points[i]
            );

            precisePoints.push(precisePoint);
        }
        return precisePoints;
    }

    SelectAllPoints()
    {
        var allPoints = this.GetAllPoints();
        SelectPoints(allPoints);
    }

    ClearSelection()
    {
        SelectPoints(this.GetAllSelectedPoints(), false);
        this.CleanUpFile();
    }

    GetOtherPointBelongingToLine(point)
    {
        for (var i=0; i<this.lines.length; ++i)
        {
            if (this.lines[i].start === point)
                return this.lines[i].end;

            else if (this.lines[i].end === point)
                return this.lines[i].start;
        }
    }

    DeleteSelectedLines()
    {
        var points = this.GetAllSelectedPoints();

        for (var i = points.length - 1; i >= 0; --i)
        {
            for (var j=this.lines.length-1; j>=0; --j)
            {
                if (this.lines[j].start == points[i]
                    || this.lines[j].end == points[i])
                    this.RemoveLine(this.lines[j])
            }
        }
    }
    
    IsSomethingSelected()
    {
        for (var line of this.lines) {
            if (line.start.selected || line.end.selected)
                return true;
        }
        return false;
    }

    DuplicateLines()
    {
        var selectedLines = this.GetSelectedLines();
        var duplLines = [];
        for (var i=0; i<selectedLines.length; ++i)
        {
            duplLines.push(new Line(
                selectedLines[i].start.x,
                selectedLines[i].start.y,
                selectedLines[i].end.x,
                selectedLines[i].end.y
                ));
        }
        this.AddLines(duplLines);
    }

    SelectAllToggle()
    {
        var points = this.GetAllSelectedPoints();

        if (points.length == 0)
            this.SelectAllPoints();
        else
            this.ClearSelection();
    }
    
    GetAllPoints()
    {
        var points = [];
        for (var i=0; i<this.lines.length; ++i)
        {
            points.push(this.lines[i].start);
            points.push(this.lines[i].end);
        }
        return points;
    }

    LinesOverlapping(line1, line2)
    {
        return (line1.start.x == line2.start.x
        && line1.start.y == line2.start.y
        && line1.end.x == line2.end.x
        && line1.end.y == line2.end.y )
        ||
        (  line1.start.x == line2.end.x
        && line1.start.y == line2.end.y
        && line1.end.x == line2.start.x
        && line1.end.y == line2.start.y);
    }
    
    InvertSelection()
    {
        var points = this.GetAllPoints();
        for (var i=0; i<points.length; ++i)
        {
            points[i].selected = !points[i].selected;
        }
    }
    
    GrowSelection(redraw)
    {
        let selectedPoints = this.GetAllSelectedPoints();
        let allSelectedPoints = [];

        for (var i = 0; i < selectedPoints.length; ++i)
            allSelectedPoints = allSelectedPoints.concat(this.GetAllPointsAt(selectedPoints[i]));

        for (var i = 0; i < allSelectedPoints.length; ++i)
        {
            let p = this.GetOtherPointBelongingToLine(allSelectedPoints[i]);
            let pArray = this.GetAllPointsAt(p);

            for (var j = 0; j < pArray.length; ++j)
                pArray[j].selected = true;
        }

        if (redraw)
            Redraw();
    }

    SelectLinked()
    {
        let selPointsNumOld = 0;
        let maxIterations = 30;

        for (var i = 0; i < maxIterations; i++) {
            this.GrowSelection(false);
            
            let selPointsNum = this.GetAllSelectedPoints().length;
            
            if (selPointsNumOld == selPointsNum)
                break;
            else
                selPointsNumOld = selPointsNum;
        }
        if (i == maxIterations)
            Notify("Max Iteration Depth reached!");

        Redraw();
    }
}