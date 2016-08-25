﻿class Camera {
    static init() {
        console.log("Camera created.");

        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 1000;
        this.canvasOffset = new Vector2(0, 0);
    }

    static multiplyZoomBy(delta, keepCenter)
    {
        if (keepCenter)
            this.pushCameraCenter();

        this.setZoom(this.zoom * delta, false);

        if (keepCenter)
            this.popCameraCenter();
        Renderer.redraw();
    }

    static zoomBy(delta, keepCenter) {
        if (keepCenter)
            this.pushCameraCenter();

        this.setZoom(this.zoom + delta, false);

        if (keepCenter)
            this.popCameraCenter();
        Renderer.redraw();
    }

    static setZoom(val, keepCenter) {
        if (keepCenter)
            this.pushCameraCenter();

        this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, val));

        if (keepCenter)
            this.popCameraCenter();

        Renderer.redraw();

        GUI.writeToStats("Zoom", (this.zoom * 100).toFixed(2) + " %");
    }

    static pushCameraCenter() {
        // TODO maybe there is a better option than saving center and comparing difference?
        this.center = new Vector2(canvas.width * 0.5, canvas.height * 0.5);
        this.worldCenter = this.screenSpaceToCanvasSpace(this.center);
    }

    static popCameraCenter() {
        let newWorldCenter = this.screenSpaceToCanvasSpace(this.center);
        let diff = newWorldCenter.subtractVector(this.worldCenter);
        this.canvasOffset = this.canvasOffset.addVector(diff);

        this.center = undefined;
        this.worldCenter = undefined;
    }


    static screenSpaceToCanvasSpace(vec2) {
        return vec2
            .divide(this.zoom)
            .subtractVector(this.canvasOffset);
    }
    static canvasSpaceToScreenSpace(vec2) {
        return vec2
            .addVector(this.canvasOffset)
            .multiply(this.zoom)
        ;
    }

    static getVisibleBounds() {
        return new Bounds(
            this.screenSpaceToCanvasSpace(new Vector2(0, 0)),
            this.screenSpaceToCanvasSpace(new Vector2(canvas.width, canvas.height))
            );
    }

}