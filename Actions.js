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
        Redraw();
    }
    Redo()
    {
        var action = this.undoneActions.pop();

        if (action)
            this.PushAction(action, true);
        Redraw();
    }
}

class SelectAction {

    constructor(points) {
        this.points = points;
    }

    Do() {
        console.log("SelectAction Do()");
    }

    Undo() {
        console.log("SelectAction Undo()");
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
        var delta = {
            x: this.current.x - this.start.x,
            y: this.current.y - this.start.y
        };
        MovePointsBy(this.points, delta);
    }

    Undo() {
        var delta = {
            x: this.start.x - this.current.x,
            y: this.start.y - this.current.y
        };
        MovePointsBy(this.points, delta);
    }
}
class CreateAction {
    constructor(line)
    {
        this.line = line;
    }

    Do() {
        console.log("MoveAction Do()");
    }

    Undo() {
        console.log("MoveAction Undo()");
    }
}
class DuplicateAction {
    constructor(lines) // TODO lines or points?
    {
        this.duplicateLines = lines;
    }

    Do() {
        console.log("MoveAction Do()");
    }

    Undo() {
        console.log("MoveAction Undo()");
    }
}