// TODO check which variables are not used and remove them
class Settings {
    constructor() {
        this.canvasColor = "#666";

        this.lineWidth = 3;
        this.lineColor = "#000";
        this.lineColorFill = 'rgba(0, 0, 0, 1)';
        this.lineEndingRadius = 4;

        this.gridPointSize = 6;
        this.gridPointLineWidth = 2;
        this.gridPointLineColor = "#000";
        this.gridPointFillColor = "#999";

        this.gridLineColor = '#444';
        this.gridBigLineColor = '#333';

        this.bigGridSize = 8;
        this.bigGridPointSize = 6;
        this.bigGridPointLineWidth = 14;
        this.bigGridPointLineColor = "#000";
        this.bigGridPointFillColor = "#777";

        this.helperColor = "#5bb";
        this.helperColor2 = "#090";
        this.helperLineWidth = 1;

        this.previewLineColor = "#090";
        this.selectionColor = "#f90";
        this.selectionColorFill = 'rgba(255, 127, 0, 1)';
        this.borderSelectionColor = 'rgba(255, 127, 0, 0.5)';

        this.notificationDuration = 2000;
        this.notificationColorHalf = 'rgba(255, 127, 0, 0.75)';
        this.notificationColorFull = 'rgba(255, 127, 0, 1)';

        this.preciseSelectionLineWidth = 2;
        this.preciseSelectionSelectionColor = 'rgba(255, 127, 0, 0)';
        this.preciseSelectionNoSelectionColor = 'rgba(0, 0, 0, 0)';
    }
}
