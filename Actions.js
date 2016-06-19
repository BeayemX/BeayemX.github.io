"use strict"
var actionhistory;

// TODO remove me HACK XXX 
function TestActionHistory()
{
    actionhistory = new ActionHistory();
}

class ActionHistory
{
    constructor()
    {
        this.actions = [];
        this.undoneActions = [];
    }

    PushAction(action, redoAction)
    {
        this.actions.push(action)

        // TODO clears redo-actions if new action is performed. maybe use if possible? 
        // e.g. move lines on a new selection?
        if (arguments.length == 1 || !redoAction)
            this.undoneActions = [];

        action.Do();
    }

    PopAction()
    {
        var action = this.actions.pop();
        if (action)
        {
            action.Undo();
            this.undoneActions.push(action);
        }
    }

    Undo()
    {
        this.PopAction();
        DRAW_MANAGER.redraw();
    }
    Redo()
    {
        var action = this.undoneActions.pop();

        if (action)
            this.PushAction(action, true);
        DRAW_MANAGER.redraw();
    }
}

class SelectLinesAction {

    constructor(points) {
        this.points = points;
    }

    Do() {
        console.log("SelectLinesAction Do()");
    }

    Undo() {
        console.log("SelectLinesAction Undo()");
    }
}

class MoveAction {
    // TODO shouldn't need to save points. if selection is also an action
    constructor(points, current, start) {
        this.points = points;
        this.current = current;
        this.start = start;
    }

    Do() {
        let delta = {
            x: this.current.x - this.start.x,
            y: this.current.y - this.start.y
        };
        UTILITIES.movePointsBy(this.points, delta);
    }

    Undo() {
        var delta = {
            x: this.start.x - this.current.x,
            y: this.start.y - this.current.y
        };
        UTILITIES.movePointsBy(this.points, delta);
    }
}
class CreateLineAction {
    constructor(line)
    {
        this.line = line;
    }

    Do() {
        console.log("CreateLineAction Do()");
    }

    Undo() {
        console.log("CreateLineAction Undo()");
    }
}
class DuplicateLinesAction {
    constructor(lines) // TODO lines or points?
    {
        this.duplicateLines = lines;
    }

    Do() {
        console.log("DuplicateLinesAction Do()");
    }

    Undo() {
        console.log("DuplicateLinesAction Undo()");
    }
}