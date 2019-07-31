import 'babel-polyfill';
import SoundWoker from './SoundWorker';
import AudioNodeBuilder from '../model/AudioNodeBuilder';
import { countTime } from '../utils/log';
import VoiceModel, { ModeType } from '../model/VoiceModel';

const videoDom = document.getElementById('myVideo');

export default class AutoEffect {
    private context: AudioContext;
    private audioNodeBuilder: AudioNodeBuilder;
    private data: { recordingData: number[]; playingData: number[] } = { recordingData: [], playingData: [] };
    private soundWoker: SoundWoker = new SoundWoker((message: EffectWorkerMessage) => {
        this.data.playingData = this.data.playingData.concat(message.data);
    });

    constructor(private model: VoiceModel) {
        this.start = this.start.bind(this);
        this.effect = this.effect.bind(this);
        this.play = this.play.bind(this);
        this.reset = this.reset.bind(this);
        this.context = new AudioContext();
        this.audioNodeBuilder = new AudioNodeBuilder(this.context);
        this.reset();
    }

    async start() {
        this.model.analyserPlayingNode = this.context.createAnalyser();
        this.model.analyserRecordingNode = this.context.createAnalyser();
        // video
        const video: HTMLVideoElement = (videoDom as HTMLVideoElement) || new HTMLVideoElement();
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        video.volume = 0;
        // node
        const rNode = this.model.analyserRecordingNode as AnalyserNode;
        const recordingProcessorNode = this.context.createScriptProcessor(1024, 1, 1);
        recordingProcessorNode.onaudioprocess = this.onAudioProcess;

        // this.audioNodeBuilder.oscillator(rNode, recordingProcessorNode);
        this.audioNodeBuilder.mediaStream(video.srcObject, rNode, recordingProcessorNode);
    }

    onAudioProcess = (e: AudioProcessingEvent) => {
        if (this.model.mode != ModeType.Playing) return;
        countTime('onaudioprocess', () => {
            this.model.recordingTime += e.inputBuffer.length;
            const d = Array.prototype.slice.call(e.inputBuffer.getChannelData(0));
            if (d[0] != 0 && d[1] != 0) {
                Array.prototype.push.apply(this.data.recordingData, d);
                Array.prototype.push.apply(this.model.rawdata, d);
            }
        });
    };

    play() {
        if (this.model.mode != ModeType.Playing) return;
        countTime('play', () => {
            const data = this.data;
            if (data.playingData.length >= 1024 * 16) {
                const input = data.playingData;
                const pNode = this.model.analyserPlayingNode as AnalyserNode;
                const audioBuffer = this.context.createBuffer(1, input.length, 44100);
                audioBuffer.getChannelData(0).set(input);
                this.audioNodeBuilder.gainValue = this.model.getEffect('gain');
                this.audioNodeBuilder.audioBuffer(audioBuffer, pNode);
                data.playingData = [];
            }
        });
        setTimeout(this.play, 0);
    }

    effect() {
        if (this.model.mode != ModeType.Playing) return;
        countTime('effect', () => {
            const data = this.data;
            if (data.recordingData.length > 0) {
                const temp = data.recordingData;
                data.recordingData = [];
                this.soundWoker.post(temp, this.model.effectList);
            }
        });
        setTimeout(this.effect, 0);
    }

    reset() {
        this.data = { recordingData: [], playingData: [] };
        this.model.rawdata = [];
        this.model.recordingTime = 0;
    }
}
