class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    copy() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    toString() {
        return 'rgba(' + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    }
}