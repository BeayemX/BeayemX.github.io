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

        this.leftDict = [];
        this.rightDict = [];
        this.statsDict = [];
    }

    writeToStatusbarLeft(k, v) {
        this.leftDict[k] = v;
        let text = "";
        for (let key in this.leftDict) {
            if (this.leftDict.hasOwnProperty(key)) {
                text += key + ": ";
                text += this.leftDict[key] + ". "
            }
        }
        statusbarentryleft.innerHTML = text;
    }

    writeToStatusbarRight(k, v) {

        this.rightDict[k] = v;
        let text = "";
        for (let key in this.rightDict) {
            if (this.rightDict.hasOwnProperty(key)) {
                text += key + ": ";
                text += this.rightDict[key] + ". "
            }
        }
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
                text += "<td align='right'>";
                text += this.statsDict[key];
                text += "</td>";
                text += "</tr>";
            }
        }
        text += "</table>";

        stats.innerHTML = text;
    }

    removeEntryFromLeftStatusbar(k)
    {
        delete this.leftDict[k];
    }

    removeEntryFromRightStatusbar(k) {
        delete this.rightDict[k];
    }
    removeEntryFromStats(k) {
        delete this.statstDict[k];
    }

    objectHierarchyChanged()
    {
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
        console.log(text);
    }
}