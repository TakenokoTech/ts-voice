import "babel-polyfill";
import { Repository } from "../app";
import SoundApi from "../model/SoundApi";

export default class AutoEffect {
    private video = document.getElementById("myVideo");
    private debug = document.getElementById("debugText");
    private rTime = document.getElementById("recTime");
    private button = document.getElementById("recBtn") as HTMLButtonElement;
    private data: { recordingData: number[]; playingData: number[] } = { recordingData: [], playingData: [] };
    private context: AudioContext | null = null;

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
        // let recordingData: number[] = [];
        // let playingData: number[] = [];
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
            // console.log("onaudioprocess", data.recordingData.length);
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
    }

    private play() {
        const startTime = performance.now();
        const context = this.context as AudioContext;
        const data = this.data;
        data.playingData = data.playingData.concat(data.recordingData);
        data.recordingData = [];
        if (data.playingData.length >= 1024 * 8) {
            this.createAudioBuffer(context, data.playingData);
            data.playingData = [];
        }
        setTimeout(this.play, 0);
        const endTime = performance.now();
        console.log(`play: ${endTime - startTime}`);
    }

    private effect() {
        const request = recordingData;
        if (request.length < 3000) {
            setTimeout(this.effect, 10);
            return;
        }
        recordingData = [];
        const startTime = performance.now();
        SoundApi.callapi(request).then(response => {
            playingData = playingData.concat(response);
            const endTime = performance.now();
            console.log(`effect: ${endTime - startTime} ${request.length}`);
            this.effect();
        });
    }

    private createAudioBuffer(context: AudioContext, input: number[] | Float32Array, onended: () => void = () => {}) {
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
