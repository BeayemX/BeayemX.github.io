// TODO check which variables are not used and remove them
class Settings {
    static init() {
        this.canvasColor = "#666";

        this.previewLineWidth = 1;
        this.previewLineColor = "#090";

        this.lineColorFill = 'rgba(0, 0, 0, 1)'; // gradient

        this.gridPointSize = 6; // only for precise selection...

        this.helperColor = "#5bb";
        this.helperColor2 = "#090";
        this.helperLineWidth = 1;

        this.selectionColor = "#f90"; 
        this.selectionColorFill = 'rgba(255, 127, 0, 1)'; // gradient
        this.borderSelectionColor = 'rgba(255, 127, 0, 0.5)';

        this.preciseSelectionHandleSize = 5;
        this.preciseSelectionLineWidth = 2;
        this.preciseSelectionSelectionColor = 'rgba(255, 127, 0, 0)';
        this.preciseSelectionNoSelectionColor = 'rgba(0, 0, 0, 0)';
    }
}
