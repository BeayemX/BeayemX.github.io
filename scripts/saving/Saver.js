class Saver {
    static init() {
        console.log("Saver created. ");

        this.autosaveFileName = "AutoSave";
        this.clipboardFileName = "Clipboard";
    }

    static autoSave() {
        localStorage.setItem(this.autosaveFileName, EXPORTER.generateSVGString());
        console.log("Saved to local storage.")
    }

    static loadAutoSave() // SIFU TODO combine with loading from file
    {
        let autoSaveFile = localStorage.getItem(this.autosaveFileName);
        if (!autoSaveFile) {
            Saver.newFile();
            return;
        }

        this.createFileFromSVGString(autoSaveFile);
        Renderer.redraw();
    }

    static newFile() {
        ACTION_HISTORY = new ActionHistory();
        File.init();
        SELECTION = new Selection();
        File.createNewLayer(true);
        File.updateStats();
        Renderer.redraw();
    }

    static copyLinesToClipboard() // session storage
    {
        let selectedLines = SELECTION.lines;
        let layer = File.currentLayer;
        let svgData = "";
        svgData += "<svg>\n";
        svgData += EXPORTER.generateSVGStringForLines(selectedLines, layer, 0);
        svgData += "</svg>";

        sessionStorage.setItem(this.clipboardFileName, svgData);

        GUI.notify("Lines copied to clipboard!");
    }

    static pasteLines() // session storage
    {
        let logo = sessionStorage.getItem(this.clipboardFileName);
        if (!logo)
            return false;

        var parser = new DOMParser();
        var doc = parser.parseFromString(logo, "image/svg+xml");
        let svg = doc.getElementsByTagName('svg')[0];
        SELECTION.clearSelection();

        let lines = [];
        for (let line of svg.childNodes) {
            if (line.nodeType != 1)
                continue;

            File.addLine(new Line(
                    Number(line.getAttribute("x1")),
                    Number(line.getAttribute("y1")),
                    Number(line.getAttribute("x2")),
                    Number(line.getAttribute("y2")),
                    Color.hexToColor(line.getAttribute('stroke')),
                    Number(line.getAttribute('stroke-width'))
                ),
                true
                );
        }
        File.currentLayer.addLines(lines);
        GUI.notify("Lines pasted from clipboard!");

        Renderer.redraw();
        File.updateStats();
        return true;
    }

    static handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    static handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        for (var i = 0, f; f = files[i]; i++) {

            let reader = new FileReader();
            reader.readAsText(files[i]);
            //reader.onload = (evt) => Saver.dndloaded(evt);
            reader.onload = (evt) => Saver.dndloadedSVG(evt);


        }
    }
    static dndloadedSVG(evt) {
        this.createFileFromSVGString(evt.target.result);
    }

    static createFileFromSVGString(svgString) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgString, "image/svg+xml");
        let svg = doc.getElementsByTagName('svg')[0];

        // TODO just copied from Saver.newFile(). should be unified
        ACTION_HISTORY = new ActionHistory();
        File = new File();
        SELECTION = new Selection();
        //File.createNewLayer(true);
        File.updateStats();
        Renderer.redraw();
        // END copy paste

        for (let g of svg.childNodes) {

            if (g.nodeType != 1)
                continue;

            let layer = File.createNewLayer(true);
            layer.name = g.getAttribute("name");

            let lines = [];
            for (let line of g.childNodes) {
                if (line.nodeType != 1)
                    continue;

                lines.push(new Line(
                    Number(line.getAttribute("x1")),
                    Number(line.getAttribute("y1")),
                    Number(line.getAttribute("x2")),
                    Number(line.getAttribute("y2")),
                    Color.hexToColor(line.getAttribute('stroke')),
                    Number(line.getAttribute('stroke-width'))
                    ));
            }
        // not using addLine() because due to 'cutLines' it could lead to unwanted results
            layer.lines = lines;
        }
        GUI.objectHierarchyChanged();
        Renderer.redraw();
        File.updateStats();
    }
}