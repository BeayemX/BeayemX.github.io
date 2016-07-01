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

    static rgbaToColor(rgba)
    {
        let c = new Color(0, 0, 0, 0);
        rgba = rgba.replace('rgba(', '');
        rgba = rgba.replace(')', '');
        let rgbaArray = rgba.split(',');

        c.r = Number(rgbaArray[0]);
        c.g = Number(rgbaArray[1]);
        c.b = Number(rgbaArray[2]);
        c.a = Number(rgbaArray[3]);
        return c;
    }
}