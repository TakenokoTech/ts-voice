import AutoEffect from "./sound/AutoEffect";
import Graph from "./sound/Graph";
import Waveform from "./sound/Waveform";
import VoiceModel from "./model/VoiceModel";

export interface Repository {
    model: VoiceModel;
    update: { [key: string]: () => {} };
}

const context: Repository = { model: new VoiceModel(), update: {} };
const autoEffect = new AutoEffect(context);
const graph = new Graph(context);
const waveform = new Waveform(context);

const id = setInterval(() => {
    if (!context.model.analyserNode || !context.model.analyserPlayNode) {
        graph.clear().update([], [], [], []);
        waveform.clear().update([]);
        return;
    }
    context.model.analyserNode.minDecibels = -150;
    context.model.analyserNode.maxDecibels = -30;
    const recordFrequencyData = new Uint8Array(context.model.analyserNode.frequencyBinCount);
    const recordTimeDomainData = new Uint8Array(context.model.analyserNode.frequencyBinCount);
    const recordFrequencyFloatData = new Float32Array(context.model.analyserNode.frequencyBinCount);
    const recordTimeDomainFloatData = new Float32Array(context.model.analyserNode.frequencyBinCount);
    context.model.analyserNode.getByteFrequencyData(recordFrequencyData);
    context.model.analyserNode.getByteTimeDomainData(recordTimeDomainData);
    context.model.analyserNode.getFloatFrequencyData(recordFrequencyFloatData);
    context.model.analyserNode.getFloatTimeDomainData(recordTimeDomainFloatData);
    const playFrequencyData = new Uint8Array(context.model.analyserPlayNode.frequencyBinCount);
    const playTimeDomainData = new Uint8Array(context.model.analyserPlayNode.frequencyBinCount);
    const playFrequencyFloatData = new Float32Array(context.model.analyserPlayNode.frequencyBinCount);
    const playTimeDomainFloatData = new Float32Array(context.model.analyserPlayNode.frequencyBinCount);
    context.model.analyserPlayNode.getByteFrequencyData(playFrequencyData);
    context.model.analyserPlayNode.getByteTimeDomainData(playTimeDomainData);
    context.model.analyserPlayNode.getFloatFrequencyData(playFrequencyFloatData);
    context.model.analyserPlayNode.getFloatTimeDomainData(playTimeDomainFloatData);
    if (playFrequencyFloatData[0] > -120) {
        graph
            .clear()
            .update(recordFrequencyData, recordTimeDomainData, recordFrequencyFloatData, recordTimeDomainFloatData, 0)
            .update(playFrequencyData, playTimeDomainData, playFrequencyFloatData, playTimeDomainFloatData, 1);
    }
    if (context.model.rawdata) {
        waveform.clear().update(context.model.rawdata);
    }
}, 10);
