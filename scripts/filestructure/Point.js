class Point extends Vector2 {

    constructor(x, y, line) {
        super(x, y);
        this.line = line;
    }

    get opposite(){
        return this.line.opposite(this);
    }
    copy() {
        return new Point(this.x, this.y, this.line);
    }
}