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

        this.layersDiv = document.getElementById('layers')
    }

    writeToStatusbarLeft(text) {
        statusbarentryleft.innerHTML = text;
    }

    writeToStatusbarRight(text) {
        statusbarentryright.innerHTML = text;
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