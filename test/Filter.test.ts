import { describe, it } from "mocha";
import { assert } from "chai";
import Filter from "../src/model/Filter";

describe("Test1", () => {
    it("succrss", () => {
        const testdata = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
        const lowpass = Filter.lowpass(testdata);
        assert.equal(lowpass, []);
    });
});
