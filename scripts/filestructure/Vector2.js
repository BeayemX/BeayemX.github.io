// TODO use static methods for addVector and so on?
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    add(value) {
        return new Vector2(this.x + value, this.y + value);
    }

    subtract(value) {
        return this.add(-value);
    }

    multiply(value) {
        return new Vector2(this.x * value, this.y * value);
    }

    divide(value) {
        return this.multiply(1.0 / value);
    }

    addVector(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtractVector(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    static distance(v1, v2) {
        return (v2.subtractVector(v1)).magnitude();
    }

    static sqrDistance(v1, v2) {
        return (v2.subtractVector(v1)).sqrMagnitude();
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sqrMagnitude() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        let magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

        this.x /= magnitude;
        this.y /= magnitude;
    }

    normalized() {
        let retVec = this.copy();
        retVec.normalize();
        return retVec;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    rounded() {
        let retVec = this.copy();
        retVec.round();
        return retVec();
    }

    setValues(x, y) {
        if (arguments.length == 1) {
            y = x.y;
            x = x.x;
        }
        this.x = x;
        this.y = y;
    }

    static dot(v, u) {
        let val =
            u.x * v.x +
            u.y * v.y;
        return val;
    }

    equals(other) {
        let epsilon = 0.01; // TODO STATIC??
        return Vector2.sqrDistance(this, other) <= (epsilon * epsilon);
    }

    toString(decimals) {
        if (decimals == undefined)
            decimals = 2;

        let x = +this.x.toFixed(2);
        let y = +this.y.toFixed(2);

        return "(" + x + "|" + y + ")";
    }
}