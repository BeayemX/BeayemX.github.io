class TriangleGrid {
    constructor() {
        this.cells = 20;
        this.width = 25;
        this.height = 25;
        this.uniform = true;
        this.swapXAndYForTriangles = false;
        this.gridThickness = 0.33;
        this.gridColor = '#444';
        this.bigGridColor = '#222';
        this.bigGridSteps = 4;

        if (this.uniform)
            this.uniformHeight();
    }

    uniformHeight() {
        this.height = this.width / Math.cos(30 * (Math.PI / 180));
    }

    drawGrid() {
        for (let i = -this.cells; i <= this.cells; i++) {

            let color = i % this.bigGridSteps == 0 ? this.bigGridColor : this.gridColor;
            let hex = i * (i < 0 ? 0.5 : -0.5);
            let hexP = i * 0.5 + hex;
            let hexM = i * 0.5 - hex;

            if (this.swapXAndYForTriangles) {
                this.drawLine(new Vector2((-this.cells - hex) * this.height, i * this.width), new Vector2((this.cells + hex) * this.height, i * this.width), color);
                this.drawLine(new Vector2((-this.cells - hexP) * 0.5 * this.height + i * this.height, (-this.cells - hexP) * this.width), new Vector2((this.cells - hexM) * 0.5 * this.height + i * this.height, (this.cells - hexM) * this.width), color);
                this.drawLine(new Vector2((this.cells - hexM) * 0.5 * this.height + i * this.height, (-this.cells + hexM) * this.width), new Vector2((-this.cells - hexP) * 0.5 * this.height + i * this.height, (this.cells + hexP) * this.width), color);
            }
            else {
                this.drawLine(new Vector2(i * this.width, (-this.cells - hex) * this.height), new Vector2(i * this.width, (this.cells + hex) * this.height), color);
                this.drawLine(new Vector2((-this.cells - hexP) * this.width, (-this.cells - hexP) * 0.5 * this.height + i * this.height), new Vector2((this.cells - hexM) * this.width, (this.cells - hexM) * 0.5 * this.height + i * this.height), color);
                this.drawLine(new Vector2((-this.cells + hexM) * this.width, (this.cells - hexM) * 0.5 * this.height + i * this.height), new Vector2((this.cells + hexP) * this.width, (-this.cells - hexP) * 0.5 * this.height + i * this.height), color);
            }
        }
    }

    getNearestPointFor(position) {
        let snapX
        let snapY;

        if (this.swapXAndYForTriangles)
            position = new Vector2(position.y, position.x);

        let intX = Math.round(position.x / this.width);
        snapX = intX * this.width;


        if (intX % 2 == 0)
            snapY = Math.round(position.y / this.height) * this.height;
        else
            snapY = (Math.round(position.y / this.height + 0.5) - 0.5) * this.height;

        let firstCandidate = new Vector2(snapX, snapY);
        let secondCandidate = new Vector2(snapX + this.width * (snapX < position.x ? 1 : -1), snapY + this.height * (snapY < position.y ? 0.5 : -0.5));
        let firstDistance = (firstCandidate.subtractVector(position)).sqrMagnitude();
        let secondDistance = (secondCandidate.subtractVector(position)).sqrMagnitude();

        if (this.swapXAndYForTriangles)
            if (firstDistance < secondDistance)
                return new Vector2(firstCandidate.y, firstCandidate.x);
            else
                return new Vector2(secondCandidate.y, secondCandidate.x);
        else
            return firstDistance < secondDistance ? firstCandidate : secondCandidate;

        return new Vector2(snapX, snapY);
    }

    drawLine(p1, p2, color) {
        Renderer.drawLineFromTo(p1, p2, this.gridThickness, color, false, true, true);
    }
}