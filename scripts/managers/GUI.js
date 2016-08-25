class Gui {
    constructor() {
        console.log("GUI created.");

        this.menubar = document.getElementById("menubar");
        this.statusbar = document.getElementById("statusbar");
        this.statusbarentryleft = document.getElementById("statusbarentryleft");
        this.statusbarentryright = document.getElementById("statusbarentryright");
        this.leftarea = document.getElementById('leftarea');
        this.rightarea = document.getElementById('rightarea');
        this.rightarea.style.visibility = "visible";
        this.stats = document.getElementById('stats');

        this.layersDiv = document.getElementById('layers')

        this.statsDict = [];

        this.gridSettings = document.getElementById("gridSettings");
    }

    genereateGridSettings() {
        while (this.gridSettings.firstChild) {
            this.gridSettings.removeChild(this.gridSettings.firstChild);
        }

        if (GRID.grid instanceof RectangleGrid) {

            this.gridSettings.appendChild(document.createTextNode("gridSize"));
            let input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "1");
            input.setAttribute("max", "100");
            input.setAttribute("value", "10");
            input.setAttribute("onchange", "GRID.grid.gridSize = value; RENDERER.redraw()");
            this.gridSettings.appendChild(input);

            this.gridSettings.appendChild(document.createTextNode("cellNumber"));
            input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "1");
            input.setAttribute("value", "32");
            input.setAttribute("onchange", "GRID.grid.gridCellNumber= value; RENDERER.redraw()");
            this.gridSettings.appendChild(input);
        }
        else if (GRID.grid instanceof TriangleGrid) {
            this.gridSettings.appendChild(document.createTextNode("cells"));
            let input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "1");
            input.setAttribute("max", "100");
            input.setAttribute("value", "20");
            input.setAttribute("onchange", "GRID.grid.cells = value; RENDERER.redraw()");
            this.gridSettings.appendChild(input);

            this.gridSettings.appendChild(document.createTextNode("width"));
            input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "1");
            input.setAttribute("value", "32");
            input.setAttribute("onchange", "GRID.grid.width = value; RENDERER.redraw()");
            this.gridSettings.appendChild(input);

            this.gridSettings.appendChild(document.createTextNode("height"));
            input = document.createElement("input");
            input.setAttribute("type", "number");
            input.setAttribute("min", "1");
            input.setAttribute("value", "32");
            input.setAttribute("onchange", "GRID.grid.height = value; RENDERER.redraw()");
            this.gridSettings.appendChild(input);


            input = document.createElement("input");
            input.setAttribute("type", "button");
            input.setAttribute("onclick", "GRID.grid.uniformHeight(); RENDERER.redraw()");
            input.value = "Uniform Height";
            this.gridSettings.appendChild(input);

            input = document.createElement("input");
            input.setAttribute("type", "button");
            input.setAttribute("onclick", "GRID.grid.swapXAndYForTriangles = !GRID.grid.swapXAndYForTriangles ; RENDERER.redraw()");
            input.value = "Swap X and Y for triangles";
            this.gridSettings.appendChild(input);
        }
    }

    writeToStatusbarLeft(text) {
        statusbarentryleft.innerHTML = text;
    }

    writeToStatusbarRight(text) {
        statusbarentryright.innerHTML = text;
    }

    writeToStats(k, v) {
        this.statsDict[k] = v;
        let text = "<table>";
        for (let key in this.statsDict) {
            if (this.statsDict.hasOwnProperty(key)) {
                text += "<tr>";
                text += "<td>";
                text += key;
                text += "</td>";
                text += "<td>";
                text += "&nbsp;";
                text += "</td>";
                text += "<td align='right'>";
                text += this.statsDict[key];
                text += "</td>";
                text += "</tr>";
            }
        }
        text += "</table>";

        stats.innerHTML = text;
    }

    removeEntryFromStats(k) {
        delete this.statstDict[k];
    }

    objectHierarchyChanged() {
        while (this.layersDiv.firstChild) {
            this.layersDiv.removeChild(this.layersDiv.firstChild);
        }

        let layers = FILE.layers;
        let table = document.createElement("table");


        // hide layer button
        let col = document.createElement("col");
        col.setAttribute("width", "15%");
        table.appendChild(col);

        // select layer button
        col = document.createElement("col");
        col.setAttribute("width", "50");
        table.appendChild(col);

        // delete layer button
        col = document.createElement("col");
        col.setAttribute("width", "15%");
        table.appendChild(col);

        for (let i = 0; i < layers.length; i++) {
            let tr = document.createElement("tr");
            table.appendChild(tr);


            // hide layer button
            let td = document.createElement("td");
            tr.appendChild(td);
            let button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("onclick", "FILE.toggleVisibilityOfLayerWithID(" + i + ")");
            if (layers[i].visible)
                button.innerHTML = "O";
            else
                button.innerHTML = "-";
            td.appendChild(button);

            // select layer button
            td = document.createElement("td");
            tr.appendChild(td);
            button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "layerbutton");
            button.setAttribute("onmousedown", "FILE.selectLayerWithID(" + i + ")");
            button.setAttribute("oncontextmenu", "this.focus(); document.execCommand('selectAll',false,null);");
            button.setAttribute("contenteditable", "true");
            button.setAttribute("oninput", "FILE.changeNameForLayerWithID(" + i + ", this.innerHTML)");

            if (FILE.currentLayer == layers[i]) {
                button.setAttribute("id", "selectedButton");
                tr.setAttribute("id", "selectedLayer");
            }
            button.innerHTML = layers[i].name;
            td.appendChild(button);

            // delete layer button
            td = document.createElement("td");
            tr.appendChild(td);
            button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("onclick", "FILE.deleteLayerWithID(" + i + ")");
            button.innerHTML = "<font color='red'>X</font>";
            td.appendChild(button);
        }
        this.layersDiv.appendChild(table);
    }

    // TODO rework notifications. put somewhere in statusbar
    notify(text) {
        this.writeToStatusbarRight(text);
        //console.log(text);
    }

    toggleStatsVisibility() {
        console.log(this.stats.style);
        if (this.stats.style.visibility == "hidden")
            this.stats.style.visibility = "visible"
        else
            this.stats.style.visibility = "hidden"
    }
}