class Exporter {
    constructor() {
        console.log("Exporter created. ");
    }

    TakeScreenshot() // img
    {
        let w = window.open('about:blank', 'image from canvas');
        // also save blueprint
        w.document.write("<img src='"+canvas.toDataURL("image/png")+"' alt='from canvas'/>");

        LOGIC.setState(StateEnum.RENDERPREVIEW);
        DRAW_MANAGER.redraw();
        w.document.write("<img src='" + canvas.toDataURL("image/png") + "' alt='from canvas'/>");

        LOGIC.setState(StateEnum.IDLE);
        DRAW_MANAGER.redraw();
        GUI.notify("Picture saved!");
    }

    ExportAsSVG() // SVG // TOOD IMPLEMENT ME
    {
        //var name = prompt("Save as: ");
        var name = "svgTest";
        if (name) {
            let svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';
            let layers = DATA_MANAGER.currentFile.lineObjects;
            
            for (let layer of layers)
            {
                svgData += '\t<g ';
                svgData += 'stroke="' + layer.color.toString() + '" ';
                svgData += 'stroke-width="' + layer.thickness + '" ';
                svgData += '>\n';
                for (let line of layer.lines) {
                    svgData +=
                        '\t\t<line ' +
                        'x1="' + line.start.x + '" ' +
                        'y1="' + line.start.y + '" ' +
                        'x2="' + line.end.x + '" ' +
                        'y2="' + line.end.y + '" ' +
                        '/> \n'
                }
                svgData += '\t</g>\n';

            }

            svgData += '</svg>';

            var blob = new Blob([svgData], { type: "application/svg+xml" });
            saveAs(blob, name + ".svg");
        }
    }
}