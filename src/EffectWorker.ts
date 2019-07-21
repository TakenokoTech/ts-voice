import * as Mathjs from "mathjs";
import FFT from "./model/FFT";
import Filter from "./model/Filter";

self.addEventListener("message", message => {
    let data: number[] = [];
    const temp = message.data;
    for (let i = 0; i < temp.length; i += 1024) {
        const input = temp.slice(i, 1024 + i);
        const comp = FFT.toComplex(input);
        const fft = FFT.fft(comp);
        const db = changeDb(fft);
        const effectFft = cut(db);
        const hz = changeHz(effectFft);
        const ifft = FFT.ifft(hz);
        const num = FFT.toNumbar(ifft);
        const output = new Filter(num)
            .bandpass(880)
            // .bandstop(880)
            // .lowshelf(440)
            // .highshelf(2756)
            // .lowpass(1378)
            // .highpass(1320)
            .output();
        data = data.concat(output.map(v => (Math.abs(v) > 0.01 ? v : v)));
    }
    self.postMessage(data, message.data.from);
});

function cut(comp: math.Complex[]) {
    comp.forEach((v, i) => {
        //if (i > 64) comp[i] = Mathjs.complex(-100.0, 0.0);
    });
    // comp = shiftpitch(comp, 2);
    return comp;
}

// ChangeDb : DB値に変換
function changeDb(comp: math.Complex[]): math.Complex[] {
    const temp: math.Complex[] = comp.map(() => Mathjs.complex(0, 0));
    for (const index in comp) {
        temp[index] = Mathjs.multiply(Mathjs.log10(comp[index]), Mathjs.complex(20, 0)) as Mathjs.Complex;
    }
    return temp;
}

// ChangeHz : Hz値に変換
function changeHz(comp: math.Complex[]): math.Complex[] {
    const temp: math.Complex[] = comp.map(() => Mathjs.complex(0, 0));
    for (const index in comp) {
        temp[index] = Mathjs.pow(10.0, Mathjs.divide(comp[index], 20) as Mathjs.Complex) as Mathjs.Complex;
    }
    return temp;
}

// Shiftpitch :
function shiftpitch(comp: math.Complex[], limit: number): math.Complex[] {
    const temp: math.Complex[] = comp.map(v => v);
    const d: number = 2.0 ** (1.0 / 12.0);
    for (const index in comp) {
        const target: number = +index / d ** limit;
        if (target < temp.length) {
            temp[index] = comp[Math.floor(target)];
        }
    }
    return temp;
}
