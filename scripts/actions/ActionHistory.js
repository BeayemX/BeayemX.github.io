class ActionHistory
{
    static init()
    {
        console.log("ActionHistory created.");

        this.actions = [];
        this.undoneActions = [];
    }

    static pushAction(action, redoAction)
    {
        this.actions.push(action)

        // TODO clears redo-actions if new action is performed. maybe use if possible? 
        // e.g. move lines on a new selection?
        if (arguments.length == 1 || !redoAction)
            this.undoneActions = [];

        action.Do();
    }

    static popAction()
    {
        var action = this.actions.pop();
        if (action)
        {
            action.undo();
            this.undoneActions.push(action);
        }
    }

    static undo()
    {
        this.popAction();
        Renderer.redraw();
    }
    static redo()
    {
        var action = this.undoneActions.pop();

        if (action)
            this.pushAction(action, true);
        Renderer.redraw();
    }
}