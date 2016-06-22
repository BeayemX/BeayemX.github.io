class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    Add(value) {
        return new Vector2(this.x + value, this.y + value);
    }

    Subtract(value) {
        this.Add(-value);
        return this;
    }

    Multiply(value) {
        return new Vector2(this.x * value, this.y * value);
    }

    Divide(value) {
        return this.Multiply(1.0 / value);
    }

    AddVector(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    SubtractVector(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    Distance(other) {
        var vec2 = {
            x: other.x - this.x,
            y: other.y - this.y
        }
        return Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
    }

    Normalize() {
        var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

        this.x /= magnitude;
        this.y /= magnitude;
    }

    toString() {
        return "(" + this.x + "|" + this.y + ")";
    }
}