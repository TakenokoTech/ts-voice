import "babel-polyfill";
import { Repository } from "../app";
import SoundApi from "../model/SoundApi";
import FFT from "../model/FFT";
import SoundWoker from "./SoundWorker";

export default class AutoEffect {
    private video = document.getElementById("myVideo");
    private debug = document.getElementById("debugText");
    private rTime = document.getElementById("recTime");
    private button = document.getElementById("recBtn") as HTMLButtonElement;
    private data: { recordingData: number[]; playingData: number[] } = { recordingData: [], playingData: [] };
    private context: AudioContext | null = null;

    private soundWoker: SoundWoker = new SoundWoker((message: MessageEvent) => {
        this.data.playingData = this.data.playingData.concat(message.data);
    });

    constructor(private repository: Repository) {
        this.start = this.start.bind(this);
        this.effect = this.effect.bind(this);
        this.play = this.play.bind(this);
        repository.model.recordingTime = 0;
        this.button.disabled = false;
        this.button.addEventListener("click", () => {
            this.button.disabled = true;
            this.start();
        });
    }

    async start() {
        const data = this.data;
        const context = (this.context = new AudioContext()) as AudioContext;
        const analyserNode = (this.repository.model.analyserNode = context.createAnalyser());
        // video dom
        const video: HTMLVideoElement = (this.video as HTMLVideoElement) || new HTMLVideoElement();
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        video.volume = 0;
        const mediaStreamAudioSourceNode = context.createMediaStreamSource(video.srcObject);
        // node
        const recordingProcessorNode = context.createScriptProcessor(1024, 1, 1);
        recordingProcessorNode.onaudioprocess = e => {
            console.log("onaudioprocess", data.recordingData.length);
            this.repository.model.recordingTime += e.inputBuffer.length;
            const d = Array.prototype.slice.call(e.inputBuffer.getChannelData(0));
            if (d[0] != 0 && d[1] != 0) {
                Array.prototype.push.apply(data.recordingData, d);
                Array.prototype.push.apply(this.repository.model.rawdata, d);
            }
        };
        // connect
        recordingProcessorNode.connect(context.destination);
        mediaStreamAudioSourceNode.connect(recordingProcessorNode);
        mediaStreamAudioSourceNode.connect(analyserNode);
        // play
        this.repository.model.analyserPlayNode = context.createAnalyser();
        this.play();
        this.effect();
    }

    private play() {
        const startTime = performance.now();
        const data = this.data;
        if (data.playingData.length >= 1024 * 16) {
            this.createAudioBuffer(data.playingData);
            data.playingData = [];
        }
        setTimeout(this.play, 0);
        const endTime = performance.now();
        // console.log(`  play: ${endTime - startTime}`);
    }

    private effect() {
        const startTime = performance.now();
        const data = this.data;
        if (data.recordingData.length > 0) {
            const temp = data.recordingData;
            data.recordingData = [];
            this.soundWoker.post(temp);
        }
        setTimeout(this.effect, 0);
        const endTime = performance.now();
        // console.log(`effect: ${endTime - startTime}`);
    }

    private createAudioBuffer(input: number[] | Float32Array, onended: () => void = () => {}) {
        const context = this.context as AudioContext;
        const audioBuffer = context.createBuffer(1, input.length, 44100);
        const audioBufferSourceNode = context.createBufferSource();
        audioBuffer.getChannelData(0).set(input);
        audioBufferSourceNode.loop = false;
        audioBufferSourceNode.loopStart = 0;
        audioBufferSourceNode.playbackRate.value = 1.0;
        audioBufferSourceNode.connect(context.destination);
        audioBufferSourceNode.onended = onended;
        audioBufferSourceNode.buffer = audioBuffer;
        audioBufferSourceNode.loopEnd = audioBuffer.duration;
        audioBufferSourceNode.start(0);
        return audioBufferSourceNode;
    }
}
