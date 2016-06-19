class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Copy() {
        return new Vector2(this.x, this.y);
    }

    Add(value) {
        this.x += value;
        this.y += value;
    }

    Subtract(value) {
        this.Add(-value);
    }

    Multiply(value) {
        this.x *= value;
        this.y *= value;
    }

    Divide(value) {
        this.Multiply(1 / value);
    }

    AddVector(other) {
        this.x += other.x;
        this.y += other.y;
    }

    SubtractVector(other) {
        this.x -= other.x;
        this.y -= other.y;
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
}