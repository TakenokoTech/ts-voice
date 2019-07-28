import AutoEffect from '../sound/AutoEffect';

export enum ModeType {
    Stopping,
    Playing,
}

export default class VoiceModel {
    mode: ModeType = ModeType.Stopping;
    analyserPlayingNode: AnalyserNode | null = null;
    analyserRecordingNode: AnalyserNode | null = null;
    recordingTime: number = 0;
    rawdata: [] = [];
    effectList: MapList = [];
    effect: AutoEffect = new AutoEffect(this);

    constructor() {
        this.effect.start();
    }

    start() {
        this.effect.play();
        this.effect.effect();
    }

    stop() {
        this.effect.reset();
    }

    get analyserRecordingData() {
        const size = (this.analyserRecordingNode && this.analyserRecordingNode.frequencyBinCount) || 0;
        const recordFrequencyData = new Uint8Array(size);
        const recordTimeDomainData = new Uint8Array(size);
        const recordFrequencyFloatData = new Float32Array(size);
        const recordTimeDomainFloatData = new Float32Array(size);
        if (this.analyserRecordingNode) {
            this.analyserRecordingNode.minDecibels = -150;
            this.analyserRecordingNode.maxDecibels = -30;
            this.analyserRecordingNode.getByteFrequencyData(recordFrequencyData);
            this.analyserRecordingNode.getByteTimeDomainData(recordTimeDomainData);
            this.analyserRecordingNode.getFloatFrequencyData(recordFrequencyFloatData);
            this.analyserRecordingNode.getFloatTimeDomainData(recordTimeDomainFloatData);
        }
        return {
            frequencyData: recordFrequencyData,
            timeDomainData: recordTimeDomainData,
            frequencyFloatData: recordFrequencyFloatData,
            timeDomainFloatData: recordTimeDomainFloatData,
        };
    }

    get analyserPlayingData() {
        const size = (this.analyserPlayingNode && this.analyserPlayingNode.frequencyBinCount) || 0;
        const playFrequencyData = new Uint8Array(size);
        const playTimeDomainData = new Uint8Array(size);
        const playFrequencyFloatData = new Float32Array(size);
        const playTimeDomainFloatData = new Float32Array(size);
        if (this.analyserPlayingNode) {
            this.analyserPlayingNode.getByteFrequencyData(playFrequencyData);
            this.analyserPlayingNode.getByteTimeDomainData(playTimeDomainData);
            this.analyserPlayingNode.getFloatFrequencyData(playFrequencyFloatData);
            this.analyserPlayingNode.getFloatTimeDomainData(playTimeDomainFloatData);
        }
        return {
            frequencyData: playFrequencyData,
            timeDomainData: playTimeDomainData,
            frequencyFloatData: playFrequencyFloatData,
            timeDomainFloatData: playTimeDomainFloatData,
        };
    }

    getEffect(key: string): number {
        let num = 0;
        this.effectList.forEach(v => {
            if (Object.keys(v).indexOf(key) >= 0) num = v[key];
        });
        return num;
    }
}
