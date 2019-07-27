import 'babel-polyfill';
import SoundWoker from './SoundWorker';
import AudioNodeBuilder from '../model/AudioNodeBuilder';
import { countTime } from '../utils/log';
import VoiceModel from '../model/VoiceModel';

const videoDom = document.getElementById('myVideo');
const context: AudioContext = new AudioContext();
const audioNodeBuilder: AudioNodeBuilder = new AudioNodeBuilder(context);

export default class AutoEffect {
    private data: { recordingData: number[]; playingData: number[] } = { recordingData: [], playingData: [] };
    private soundWoker: SoundWoker = new SoundWoker((message: EffectWorkerMessage) => {
        this.data.playingData = this.data.playingData.concat(message.data);
    });

    constructor(private model: VoiceModel) {
        this.start = this.start.bind(this);
        this.effect = this.effect.bind(this);
        this.play = this.play.bind(this);
        this.model.analyserPlayNode = context.createAnalyser();
        this.model.analyserNode = context.createAnalyser();
        this.model.recordingTime = 0;
    }

    async start() {
        const data = this.data;
        const analyserNode = this.model.analyserNode as AnalyserNode;
        // video
        const video: HTMLVideoElement = (videoDom as HTMLVideoElement) || new HTMLVideoElement();
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        video.volume = 0;
        // node
        const recordingProcessorNode = context.createScriptProcessor(1024, 1, 1);
        recordingProcessorNode.onaudioprocess = e => {
            //  console.log('onaudioprocess' /*, data.recordingData.length*/);
            this.model.recordingTime += e.inputBuffer.length;
            const d = Array.prototype.slice.call(e.inputBuffer.getChannelData(0));
            if (d[0] != 0 && d[1] != 0) {
                Array.prototype.push.apply(data.recordingData, d);
                Array.prototype.push.apply(this.model.rawdata, d);
            }
        };
        {
            audioNodeBuilder.oscillator(analyserNode, recordingProcessorNode);
            audioNodeBuilder.mediaStream(video.srcObject, analyserNode, recordingProcessorNode);
        }
    }

    play() {
        countTime('play', () => {
            const data = this.data;
            if (data.playingData.length >= 1024 * 16) {
                const input = data.playingData;
                const analyserPlayNode = this.model.analyserPlayNode as AnalyserNode;
                const audioBuffer = context.createBuffer(1, input.length, 44100);
                audioBuffer.getChannelData(0).set(input);
                audioNodeBuilder.audioBuffer(audioBuffer, analyserPlayNode);
                data.playingData = [];
            }
        });
        setTimeout(this.play, 0);
    }

    effect() {
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
}
