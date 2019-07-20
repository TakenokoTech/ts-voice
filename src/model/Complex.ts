export default class Complex {
    re: number;
    im: number;

    constructor(real: number, imaginary: number) {
        this.re = real;
        this.im = imaginary;
    }

    constructorR(radius: number, arg: number) {
        this.re = radius * Math.cos(arg);
        this.im = radius * Math.sin(arg);
    }

    add(c: Complex) {
        this.re += c.re;
        this.im += c.im;
    }

    product(c: Complex): Complex {
        return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
    }

    abs(): number {
        const re_sq = this.re * this.re;
        const im_sq = this.im * this.im;
        return Math.pow(re_sq + im_sq, 0.5);
    }

    toString(): string {
        return "${this.re}+%{this.im}";
    }
}
