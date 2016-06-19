"use strict"
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

        this.notificationarea = document.getElementById('notificationarea');
        this.notificationTimeout;

    }

    writeToStatusbarLeft(text) {
        statusbarentryleft.innerHTML = text;
    }
    writeToStatusbarRight(text) {
        statusbarentryright.innerHTML = text;
    }

    // TODO rework notifications... not needed?
    
    notify(text)
    {
        console.log(text);
        /*
        notificationarea.style.visibility = 'visible';
        notificationarea.innerHTML = text;
        notificationarea.style.left = window.innerWidth * 0.5 - notificationarea.offsetWidth * 0.5;
        notificationarea.style.backgroundColor = notificationColorHalf;

        clearTimeout(this.notificationTimeout);

        this.notificationTimeout = setTimeout(this.clearNotification, notificationDuration);
        */
    }
    /*
    notificationEnter()
    {
        this.clearTimeout(this.notificationTimeout);
        this.notificationarea.style.backgroundColor = notificationColorFull;
    }

    notificationExit()
    {
        this.reshowLastNotification();
    }

    clearNotification()
    {
        this.notificationarea.style.visibility = 'hidden';
    }*/
}