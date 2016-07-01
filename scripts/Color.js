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

    copyValues(other) {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        this.a = other.a;
    }

    toString() {
        return 'rgba(' + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    }

    equals(other) {
        return
        this.r == other.r && 
        this.g == other.g && 
        this.b == other.b && 
        this.a == other.a
    }

    toHexString()
    {
        let hexString = "#";

        hexString += this.getTwoDigitHexForNumber(this.r);
        hexString += this.getTwoDigitHexForNumber(this.g);
        hexString += this.getTwoDigitHexForNumber(this.b);

        return hexString;
    }

    getTwoDigitHexForNumber(n)
    {
        let hex = n.toString(16);
        if (hex.length < 2)
            hex = "0" + hex;
        return hex;
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

    static hexToColor(hex)
    {
        hex = hex.replace('#', '');

        let c = new Color(0, 0, 0, 1);
        c.r = parseInt(hex.substring(0, 2), 16);
        c.g = parseInt(hex.substring(2, 4), 16);
        c.b = parseInt(hex.substring(4, 6), 16);
        return c;
    }
}