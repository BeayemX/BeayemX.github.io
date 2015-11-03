"use strict"
var actionhistory;

// TODO remove me HACK XXX 
function TestActionHistory()
{
    actionhistory = new ActionHistory();
    actionhistory.PushAction(new SelectAction());
    actionhistory.PushAction(new MoveAction());
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
    }
    Redo()
    {
        var action = this.undoneActions.pop();

        if (action)
            this.PushAction(action, true);
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
    constructor(delta) {
        this.delta = delta;
    }

    Do() {
        console.log("MoveAction Do()");
    }

    Undo() {
        console.log("MoveAction Undo()");
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