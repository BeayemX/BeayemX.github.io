class Saver {
    constructor() {
        console.log("Saver created. ");

        this.autosaveFileName = "AutoSave";
        this.clipboardFileName = "Clipboard";
    }

    autoSave() {
        localStorage.setItem(this.autosaveFileName, EXPORTER.generateSVGString());
        console.log("Saved.")
    }

    loadAutoSave() // SIFU TODO combine with loading from file
    {
        let autoSaveFile = localStorage.getItem(this.autosaveFileName);
        if (!autoSaveFile) {
            SAVER.newFile();
            return;
        }

        this.createFileFromSVGString(autoSaveFile);
        DRAW_MANAGER.redraw();
    }

    newFile() {
        DATA_MANAGER.currentFile = new File();
        DATA_MANAGER.currentFile.createNewObject(true);
        DATA_MANAGER.currentFile.updateStats();
        DRAW_MANAGER.redraw();
    }

    copyLinesToClipboard() // session storage
    {
        let selectedLines = DATA_MANAGER.currentFile.getSelectedLines();
        let layer = DATA_MANAGER.currentFile.currentObject;
        let svgData = "";
        svgData += "<svg>\n";
        svgData += EXPORTER.generateSVGStringForLines(selectedLines, layer, 0);
        svgData += "</svg>";

        sessionStorage.setItem(this.clipboardFileName, svgData);

        GUI.notify("Lines copied to clipboard!");
    }

    pasteLines() // session storage
    {
        let logo = sessionStorage.getItem(this.clipboardFileName);
        if (!logo)
            return false;

        var parser = new DOMParser();
        var doc = parser.parseFromString(logo, "image/svg+xml");
        let svg = doc.getElementsByTagName('svg')[0];
        DATA_MANAGER.currentFile.clearSelection();

        let lines = [];
        for (let line of svg.childNodes) {
            if (line.nodeType != 1)
                continue;

            lines.push(new Line(
                Number(line.getAttribute("x1")),
                Number(line.getAttribute("y1")),
                Number(line.getAttribute("x2")),
                Number(line.getAttribute("y2")),
                true)
                );
        }
        DATA_MANAGER.currentFile.currentObject.addLines(lines);
        GUI.notify("Lines pasted from clipboard!");

        DRAW_MANAGER.redraw();
        DATA_MANAGER.currentFile.updateStats();
        return true;
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        for (var i = 0, f; f = files[i]; i++) {

            let reader = new FileReader();
            reader.readAsText(files[i]);
            //reader.onload = (evt) => SAVER.dndloaded(evt);
            reader.onload = (evt) => SAVER.dndloadedSVG(evt);


        }
    }
    dndloadedSVG(evt) {
        this.createFileFromSVGString(evt.target.result);
    }

    createFileFromSVGString(svgString) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgString, "image/svg+xml");
        let svg = doc.getElementsByTagName('svg')[0];

        DATA_MANAGER.currentFile = new File();

        for (let g of svg.childNodes) {

            if (g.nodeType != 1)
                continue;

            let layer = DATA_MANAGER.currentFile.createNewObject(true);
            layer.color = Color.hexToColor(g.getAttribute('stroke'));
            layer.thickness = Number(g.getAttribute('stroke-width'));
            let lines = [];
            for (let line of g.childNodes) {
                if (line.nodeType != 1)
                    continue;

                lines.push(new Line(
                    Number(line.getAttribute("x1")),
                    Number(line.getAttribute("y1")),
                    Number(line.getAttribute("x2")),
                    Number(line.getAttribute("y2"))));
            }
            // not using addLine() because due to 'cutLines' it could lead to unwanted results
            layer.lines = lines;
        }
        DRAW_MANAGER.redraw();
        DATA_MANAGER.currentFile.updateStats();
    }
}