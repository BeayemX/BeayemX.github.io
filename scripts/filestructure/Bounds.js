class Bounds {
    constructor(topLeft, bottomRight) {
        this.left = topLeft.x;
        this.top = topLeft.y;
        this.right = bottomRight.x;
        this.bottom = bottomRight.y;
    }

    contains(pos) {
        if (pos instanceof Vector2)
        {
            return this.left <= pos.x && pos.x <= this.right &&
            this.top <= pos.y && pos.y <= this.bottom;
        }
        else if (pos instanceof Line)
        {
            return this.contains(pos.start) || this.contains(pos.end);
        }
        
    }
}