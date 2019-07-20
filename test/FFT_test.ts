import { describe, it } from "mocha";
import { assert } from "chai";
import FFT from "../src/model/FFT";

describe("Test1", () => {
    it("succrss", () => {
        const testdata = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
        const comp = FFT.toComplex(testdata);
        const fft = FFT.fft(comp);
        const ifft = FFT.ifft(fft);
        const result = FFT.toNumbar(ifft);
        assert.equal(result[0], testdata[0]);
        assert.equal(result[4], testdata[4]);
        assert.equal(result[7], testdata[7]);
    });
});
