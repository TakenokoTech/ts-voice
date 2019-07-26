import "babel-polyfill";
import { Repository } from "../app";
import SoundApi from "../model/SoundApi";
import FFT from "../model/FFT";
import SoundWoker from "./SoundWorker";
import AudioNodeBuilder from "../model/AudioNodeBuilder";
import { countTime } from "../utils/log";
import Grid from "../components/Grid";

const videoDom = document.getElementById("myVideo");
const debugDom = document.getElementById("debugText");
const rTimeDom = document.getElementById("recTime");
const buttonDom = document.getElementById("recBtn") as HTMLButtonElement;
const pitchShiftDom = document.getElementById("shift") as HTMLInputElement;
const context: AudioContext = new AudioContext();
const audioNodeBuilder: AudioNodeBuilder = new AudioNodeBuilder(context);

export default class AutoEffect {
    private data: { recordingData: number[]; playingData: number[] } = { recordingData: [], playingData: [] };
    private soundWoker: SoundWoker = new SoundWoker((message: MessageEvent) => {
        this.data.playingData = this.data.playingData.concat(message.data);
    });

    constructor(private repository: Repository) {
        this.start = this.start.bind(this);
        this.effect = this.effect.bind(this);
        this.play = this.play.bind(this);
        this.repository.model.analyserPlayNode = context.createAnalyser();
        this.repository.model.analyserNode = context.createAnalyser();
        repository.model.recordingTime = 0;
        buttonDom.disabled = false;
        buttonDom.addEventListener("click", () => {
            buttonDom.disabled = true;
            this.start();
            this.play();
            this.effect();
        });
    }

    async start() {
        const data = this.data;
        const analyserNode = this.repository.model.analyserNode as AnalyserNode;
        // video
        const video: HTMLVideoElement = (videoDom as HTMLVideoElement) || new HTMLVideoElement();
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        video.volume = 0;
        // node
        const recordingProcessorNode = context.createScriptProcessor(1024, 1, 1);
        recordingProcessorNode.onaudioprocess = e => {
            console.log("onaudioprocess" /*, data.recordingData.length*/);
            this.repository.model.recordingTime += e.inputBuffer.length;
            const d = Array.prototype.slice.call(e.inputBuffer.getChannelData(0));
            if (d[0] != 0 && d[1] != 0) {
                Array.prototype.push.apply(data.recordingData, d);
                Array.prototype.push.apply(this.repository.model.rawdata, d);
            }
        };
        {
            audioNodeBuilder.oscillator(analyserNode, recordingProcessorNode);
            audioNodeBuilder.mediaStream(video.srcObject, analyserNode, recordingProcessorNode);
        }
    }

    private play() {
        countTime("play", () => {
            const data = this.data;
            if (data.playingData.length >= 1024 * 16) {
                const input = data.playingData;
                const analyserPlayNode = this.repository.model.analyserPlayNode as AnalyserNode;
                const audioBuffer = context.createBuffer(1, input.length, 44100);
                audioBuffer.getChannelData(0).set(input);
                audioNodeBuilder.audioBuffer(audioBuffer, analyserPlayNode);
                data.playingData = [];
            }
        });
        setTimeout(this.play, 0);
    }

    private effect() {
        countTime("effect", () => {
            const data = this.data;
            if (data.recordingData.length > 0) {
                const temp = data.recordingData;
                const effect: MapList = Grid.getFilterList();
                data.recordingData = [];
                this.soundWoker.post(temp, effect);
            }
        });
        setTimeout(this.effect, 0);
    }
}
