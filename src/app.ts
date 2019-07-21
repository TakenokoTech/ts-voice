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
        graph.update([], [], [], []);
        waveform.update([]);
        return;
    }
    context.model.analyserNode.minDecibels = -150;
    context.model.analyserNode.maxDecibels = -30;
    // const frequencyData = new Uint8Array(context.model.analyserNode.frequencyBinCount);
    // const timeDomainData = new Uint8Array(context.model.analyserNode.frequencyBinCount);
    // const frequencyFloatData = new Float32Array(context.model.analyserNode.frequencyBinCount);
    // const timeDomainFloatData = new Float32Array(context.model.analyserNode.frequencyBinCount);
    // context.model.analyserNode.getByteFrequencyData(frequencyData);
    // context.model.analyserNode.getByteTimeDomainData(timeDomainData);
    // context.model.analyserNode.getFloatFrequencyData(frequencyFloatData);
    // context.model.analyserNode.getFloatTimeDomainData(timeDomainFloatData);
    const frequencyData = new Uint8Array(context.model.analyserPlayNode.frequencyBinCount);
    const timeDomainData = new Uint8Array(context.model.analyserPlayNode.frequencyBinCount);
    const frequencyFloatData = new Float32Array(context.model.analyserPlayNode.frequencyBinCount);
    const timeDomainFloatData = new Float32Array(context.model.analyserPlayNode.frequencyBinCount);
    context.model.analyserPlayNode.getByteFrequencyData(frequencyData);
    context.model.analyserPlayNode.getByteTimeDomainData(timeDomainData);
    context.model.analyserPlayNode.getFloatFrequencyData(frequencyFloatData);
    context.model.analyserPlayNode.getFloatTimeDomainData(timeDomainFloatData);
    if (frequencyFloatData[0] > -120) {
        graph.update(frequencyData, timeDomainData, frequencyFloatData, timeDomainFloatData);
    }
    if (context.model.rawdata) waveform.update(context.model.rawdata);
}, 10);
