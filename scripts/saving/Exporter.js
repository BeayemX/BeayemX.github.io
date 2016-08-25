class Exporter {
    static init() {
        console.log("Exporter created. ");
    }

    static takeScreenshot() // img
    {
        let w = window.open('about:blank', 'image from canvas');
        // also save blueprint
        w.document.write("<img src='" + canvas.toDataURL("image/png") + "' alt='from canvas'/>");

        Logic.setState(StateEnum.RENDERPREVIEW);
        Renderer.redraw();
        w.document.write("<img src='" + canvas.toDataURL("image/png") + "' alt='from canvas'/>");

        Logic.setState(StateEnum.IDLE);
        Renderer.redraw();
        GUI.notify("Picture saved!");
    }

    static exportAsSVG() {
        var name = prompt("Save as: ");

        if (name) {
            let svgData = this.generateSVGString();

            var blob = new Blob([svgData], { type: "application/svg+xml" });
            saveAs(blob, name + ".svg");
            return true;
        }

        return false;
    }

    static generateSVGString() {
        let svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';
        let layers = File.layers;

        // FIXME should just also use lines in selection...
        Selection.clearSelection();

        for (let layer of layers) {
            svgData +=
                '\t<g ' +
                'name="' + layer.name + '" ' +
                //'opacity="' + layer.color.a + '" ' +

                //'stroke="' + layer.color.toHexString() + '" ' +
                //'stroke-opacity="' + (layer.color.a) + '" ' +
                //'stroke-width="' + layer.thickness + '" ' +

                '>\n';

            svgData += this.generateSVGStringForLines(layer.lines, layer, 2);
            svgData += '\t</g>\n';

        }

        svgData += '</svg>';

        return svgData;
    }

    static generateSVGStringForLines(lines, indentations) {
        let text = "";
        let indent = "";
        for (var i = 0; i < indentations; i++) {
            indent += "\t"
        }
        for (let line of lines) {
            text +=
                indent + 
                '<line ' +
                'x1="' + line.start.position.x + '" ' +
                'y1="' + line.start.position.y + '" ' +
                'x2="' + line.end.position.x + '" ' +
                'y2="' + line.end.position.y + '" ' +

                'stroke="' + line.color.toHexString() + '" ' +
                'stroke-opacity="' + (line.color.a) + '" ' +
                'stroke-width="' + line.thickness + '" ' +
                'stroke-linecap="round"' +

                '/> \n'
        }
        return text;
    }
}