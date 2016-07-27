class Camera {
    constructor() {
        console.log("Camera created.");

        this.zoom = 1;
        this.canvasOffset = new Vector2(0, 0);
    }

    zoomBy(delta) {
        // TODO maybe there is a better option than saving center and comparing difference?
        let center = new Vector2(canvas.width * 0.5, canvas.height * 0.5);
        let worldCenter = DRAW_MANAGER.screenSpaceToCanvasSpace(center);

        this.setZoom(CAMERA.zoom * delta);

        let newWorldCenter = DRAW_MANAGER.screenSpaceToCanvasSpace(center);
        let diff = newWorldCenter.subtractVector(worldCenter);
        CAMERA.canvasOffset = CAMERA.canvasOffset.addVector(diff);
    }

    setZoom(val) {
        CAMERA.zoom = val;
        GUI.writeToStats("Zoom", (CAMERA.zoom * 100).toFixed(2) + " %");
    }

}