import * as Mathjs from "mathjs";

export default class Filter {
    private q = 1 / Math.sqrt(2);
    private input: number[];

    constructor(input: number[]) {
        this.input = input;
    }

    private biquad(input: number[], a: [number, number, number], b: [number, number, number]): number[] {
        const output: number[] = input.map(() => 0);
        let [in2, in1, out1, out2] = [0, 0, 0, 0];
        for (const index in input) {
            output[index] = (b[0] / a[0]) * input[index] + (b[1] / a[0]) * in1 + (b[2] / a[0]) * in2 - (a[1] / a[0]) * out1 - (a[2] / a[0]) * out2;
            (in2 = in1), (in1 = input[index]);
            (out2 = out1), (out1 = output[index]);
        }
        return output;
    }

    lowpass(freq = 440, samplerate = 44100, q = this.q): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const alpha = Math.sin(omega) / (2.0 * q);
        const a0 = +1.0 + alpha;
        const a1 = -2.0 * Math.cos(omega);
        const a2 = +1.0 - alpha;
        const b0 = +(1.0 - Math.cos(omega)) / 2.0;
        const b1 = +(1.0 - Math.cos(omega)) / 1.0;
        const b2 = +(1.0 - Math.cos(omega)) / 2.0;
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    highpass(freq = 440, samplerate = 44100, q = this.q): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const alpha = Math.sin(omega) / (2.0 * q);
        const a0 = +1.0 + alpha;
        const a1 = -2.0 * Math.cos(omega);
        const a2 = +1.0 - alpha;
        const b0 = +(1.0 + Math.cos(omega)) / 2.0;
        const b1 = -(1.0 + Math.cos(omega)) / 1.0;
        const b2 = +(1.0 + Math.cos(omega)) / 2.0;
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    bandpass(freq = 440, bw = 1, samplerate = 44100): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const alpha = Math.sin(omega) * Math.sinh(((Math.log(2) / 2.0) * bw * omega) / Math.sin(omega));
        const a0 = +1.0 + alpha;
        const a1 = -2.0 * Math.cos(omega);
        const a2 = +1.0 - alpha;
        const b0 = +alpha;
        const b1 = +0.0;
        const b2 = -alpha;
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    bandstop(freq = 440, bw = 1, samplerate = 44100): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const alpha = Math.sin(omega) * Math.sinh(((Math.log(2) / 2.0) * bw * omega) / Math.sin(omega));
        const a0 = +1.0 + alpha;
        const a1 = -2.0 * Math.cos(omega);
        const a2 = +1.0 - alpha;
        const b0 = +1.0;
        const b1 = -2.0 * Math.cos(omega);
        const b2 = +1.0;
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    lowshelf(freq = 440, gain = 10, samplerate = 44100, q = this.q): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const A = Math.pow(10.0, gain / 40.0);
        const beta = Math.sqrt(A) / q;
        const a0 = A + 1.0 + (A - 1.0) * Math.cos(omega) + beta * Math.sin(omega);
        const a1 = -2.0 * (A - 1.0 + (A + 1.0) * Math.cos(omega));
        const a2 = A + 1.0 + (A - 1.0) * Math.cos(omega) - beta * Math.sin(omega);
        const b0 = A * (A + 1.0 - (A - 1.0) * Math.cos(omega) + beta * Math.sin(omega));
        const b1 = 2.0 * A * (A - 1.0 - (A + 1.0) * Math.cos(omega));
        const b2 = A * (A + 1.0 - (A - 1.0) * Math.cos(omega) - beta * Math.sin(omega));
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    highshelf(freq = 440, gain = 10, samplerate = 44100, q = this.q): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const A = Math.pow(10.0, gain / 40.0);
        const beta = Math.sqrt(A) / q;
        const a0 = A + 1.0 - (A - 1.0) * Math.cos(omega) + beta * Math.sin(omega);
        const a1 = 2.0 * (A - 1.0 - (A + 1.0) * Math.cos(omega));
        const a2 = A + 1.0 - (A - 1.0) * Math.cos(omega) - beta * Math.sin(omega);
        const b0 = A * (A + 1.0 + (A - 1.0) * Math.cos(omega) + beta * Math.sin(omega));
        const b1 = -2.0 * A * (A - 1.0 + (A + 1.0) * Math.cos(omega));
        const b2 = A * (A + 1.0 + (A - 1.0) * Math.cos(omega) - beta * Math.sin(omega));
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    peaking(freq = 440, gain = 10, bw = 1, samplerate = 44100, q = this.q): Filter {
        const omega = (2.0 * Math.PI * freq) / samplerate;
        const alpha = Math.sin(omega) * Math.sinh(((Math.log(2.0) / 2.0) * bw * omega) / Math.sin(omega));
        const A = Math.pow(10.0, gain / 40.0);
        const a0 = 1.0 + alpha / A;
        const a1 = -2.0 * Math.cos(omega);
        const a2 = 1.0 - alpha / A;
        const b0 = 1.0 + alpha * A;
        const b1 = -2.0 * Math.cos(omega);
        const b2 = 1.0 - alpha * A;
        this.input = this.biquad(this.input, [a0, a1, a2], [b0, b1, b2]);
        return this;
    }

    output(): number[] {
        return this.input;
    }

    switch(func: Filter, enable: boolean): Filter {
        if (enable) {
            return func;
        }
        return this;
    }
}
