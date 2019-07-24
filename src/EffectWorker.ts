import * as Mathjs from "mathjs";
import FFT from "./model/FFT";
import Filter from "./model/Filter";

self.addEventListener("message", message => {
    let data: number[] = [];
    const temp = message.data.sound;
    const filterList: MapList = message.data.effect;
    for (let i = 0; i < temp.length; i += 1024) {
        const input = temp.slice(i, 1024 + i);
        const comp = FFT.toComplex(input);
        const fft = FFT.fft(comp);
        const db = changeDb(fft);
        const effectFft = effect(db, filterList);
        const hz = changeHz(effectFft);
        const ifft = FFT.ifft(hz);
        const num = FFT.toNumbar(ifft);

        let filter = new Filter(num);
        filterList.forEach(v => {
            switch (false) {
                case !v["bandpass"]:
                    filter = filter.bandpass(880);
                case !v["bandstop"]:
                    filter = filter.bandstop(880);
                case !v["lowshelf"]:
                    filter = filter.lowshelf(440);
                case !v["highshelf"]:
                    filter = filter.highshelf(2756);
                case !v["lowpass"]:
                    filter = filter.lowpass(1378);
                case !v["highpass"]:
                    filter = filter.highpass(1320);
            }
        });
        const output = filter.output();
        data = data.concat(output.map(v => (Math.abs(v) > 0.01 ? v : v)));
    }
    self.postMessage(data, message.data.from);
});

function effect(comp: math.Complex[], filterList: { [key: string]: number }[]) {
    comp.forEach((v, i) => {
        //if (i > 64) comp[i] = Mathjs.complex(-100.0, 0.0);
    });
    filterList.forEach(v => {
        if (!isNone(v["pitchshift"])) comp = shiftpitch(comp, v["pitchshift"]);
    });
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

// Shiftpitch : ピッチシフト
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

function isNone(value: any) {
    return value == (null || undefined);
}
