import * as Mathjs from "mathjs";

class FFT {
    constructor() {
        this.fftin = this.fftin.bind(this);
    }

    private fftin(c: math.Complex[], T: number, N: number): math.Complex[] {
        const k = Math.log2(N);
        const rec: math.Complex[] = c.map((_, i) => c[this.revBit(k, i)]);
        for (let Nh = 1; Nh < N; Nh *= 2) {
            T /= 2;
            for (let s = 0; s < N; s += Nh * 2) {
                for (let i = 0; i < Nh; i++) {
                    const l = rec[s + i];
                    const x = rec[s + i + Nh];
                    const y = Mathjs.complex(Math.cos(T * i), Math.sin(T * i));
                    const re = Mathjs.multiply(x, y);
                    rec[s + i] = Mathjs.add(l, re) as Mathjs.Complex;
                    rec[s + i + Nh] = Mathjs.subtract(l, re) as Mathjs.Complex;
                }
            }
        }
        return rec;
    }

    fft(f: math.Complex[]): math.Complex[] {
        const N = f.length;
        const T = -2 * Math.PI;
        return this.fftin(f, T, N);
    }

    ifft(F: math.Complex[]): math.Complex[] {
        const N = F.length;
        const T = 2 * Math.PI;
        return this.fftin(F, T, N).map((c: math.Complex) => Mathjs.complex(c.re / N, c.im / N));
    }

    toComplex(n: number[]): math.Complex[] {
        return n.map((v: number) => Mathjs.complex(v, 0.0));
    }

    toNumbar(n: math.Complex[]): number[] {
        return n.map(v => Math.round(v.re*1000)/1000);
    }

    private revBit(k: number, n: number) {
        let r = 0;
        for (let i = 0; i < k; i++) r = (r << 1) | ((n >>> i) & 1);
        return r;
    }
}

export default new FFT();
