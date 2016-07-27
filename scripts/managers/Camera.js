class Camera {
    constructor() {
        console.log("Camera created.");

        this.zoom = 1;
        this.canvasOffset = new Vector2(0, 0);
    }

    zoomBy(delta) {
        // TODO maybe there is a better option than saving center and comparing difference?
        let center = new Vector2(canvas.width * 0.5, canvas.height * 0.5);
        let worldCenter = this.screenSpaceToCanvasSpace(center);

        this.setZoom(this.zoom * delta);

        let newWorldCenter = this.screenSpaceToCanvasSpace(center);
        let diff = newWorldCenter.subtractVector(worldCenter);
        this.canvasOffset = this.canvasOffset.addVector(diff);
    }

    setZoom(val) {
        this.zoom = val;
        GUI.writeToStats("Zoom", (this.zoom * 100).toFixed(2) + " %");
    }


    screenSpaceToCanvasSpace(vec2) {
        return vec2
            .divide(this.zoom)
            .subtractVector(this.canvasOffset);
    }
    canvasSpaceToScreenSpace(vec2) {
        return vec2
            .addVector(this.canvasOffset)
            .multiply(this.zoom)
        ;
    }

    getVisibleBounds() {
        return new Bounds(
            this.screenSpaceToCanvasSpace(new Vector2(0, 0)),
            this.screenSpaceToCanvasSpace(new Vector2(canvas.width, canvas.height))
            );
    }

}