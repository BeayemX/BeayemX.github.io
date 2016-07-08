﻿class Gui {
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

        let objs = DATA_MANAGER.currentFile.lineObjects;

        for (let i = 0; i < objs.length; i++) {
            let button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("onclick", "DATA_MANAGER.currentFile.selectObjectWithID(" + i + ")");
            button.innerHTML = "Layer" + i;
            this.layersDiv.appendChild(button);
        }
    }

    // TODO rework notifications. put somewhere in statusbar
    notify(text) {
        this.writeToStatusbarRight(text);
        //console.log(text);
    }
}