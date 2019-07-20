import FFT from "./model/FFT";

self.addEventListener("message", message => {
    let data: number[] = [];
    const temp = message.data;
    for (let i = 0; i < temp.length; i += 1024) {
        const comp = FFT.toComplex(temp.slice(i, 1024 + i));
        const fft = FFT.fft(comp);
        const ifft = FFT.ifft(fft);
        const num = FFT.toNumbar(ifft);
        data = data.concat(num);
    }
    self.postMessage(data, message.data.from);
});
