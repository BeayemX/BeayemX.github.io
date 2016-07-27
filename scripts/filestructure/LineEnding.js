class LineEnding {

    constructor(x, y, line) {
        this.position = new Vector2(x, y);
        this.line = line;
    }

    get opposite(){
        return this.line.opposite(this);
    }

    copy() {
        return new LineEnding(this.position.x, this.position.y, this.line);
    }
}