class ActionHistory
{
    constructor()
    {
        console.log("ActionHistory created.");

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
        Renderer.redraw();
    }
    Redo()
    {
        var action = this.undoneActions.pop();

        if (action)
            this.PushAction(action, true);
        Renderer.redraw();
    }
}