function TakeScreenshot() // img
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


function ExportAsSVG() // SVG
{
    var name = prompt("Save as: ");

    if (name) {
        let svgData = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n';
        let factor = 10; // TODO maybe prompt for scale factor? or create own export-dialog-prompt-window?
        let linesArray = DATA_MANAGER.currentFile.lines;

        let shiftX = 0;
        let shiftY = 0;

        for (let i = 0; i < linesArray.length; ++i) {
            shiftX = Math.min(shiftX, linesArray[i].start.x, linesArray[i].end.x);
            shiftY = Math.min(shiftY, linesArray[i].start.y, linesArray[i].end.y);
        }
        shiftX = -shiftX;
        shiftY = -shiftY;

        svgData += '\t<factor value="' + factor + '"/>\n';
        svgData += '\t<shift x="' + shiftX + '" y="' + shiftY + '"/>\n';

        for (let i = 0; i < linesArray.length; ++i) {
            svgData +=
                '\t<line ' +
                'x1="' + (shiftX + linesArray[i].start.x) * factor + '" ' +
                'y1="' + (shiftY + linesArray[i].start.y) * factor + '" ' +
                'x2="' + (shiftX + linesArray[i].end.x) * factor + '" ' +
                'y2="' + (shiftY + linesArray[i].end.y) * factor + '" ' +
                'stroke="black" ' +
                'stroke-width="1"' +
                '/> \n'
        }
        svgData += '</svg>';

        // var blob = new Blob([svgData], { type: "application/svg+xml" });
        let blob = new Blob([svgData], { type: "text/plain;charset=utf-8" });
        saveAs(blob, name + ".svg");
    }
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    for (var i = 0, f; f = files[i]; i++) {

        let reader = new FileReader();
        let jsonString = reader.readAsText(files[i]);
        reader.onload = saver.dndloaded;

    }
}