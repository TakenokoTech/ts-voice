export default class AudioNodeBuilder {
    context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
        this.gainNode = this.gainNode.bind(this);
    }

    async oscillator(analyserNode: AnalyserNode, scriptProcessorNode: ScriptProcessorNode): Promise<AudioNode> {
        const context = this.context;
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = 440;
        oscillator
            .connect(await this.gainNode())
            .connect(analyserNode)
            .connect(scriptProcessorNode)
            .connect(context.destination);
        oscillator.start();
        return Promise.resolve(oscillator);
    }

    async mediaStream(stream: MediaStream, analyserNode: AnalyserNode, scriptProcessorNode: ScriptProcessorNode): Promise<AudioNode> {
        const context = this.context;
        const mediaStreamSource = this.context.createMediaStreamSource(stream);
        mediaStreamSource
            .connect(analyserNode)
            .connect(scriptProcessorNode)
            .connect(context.destination);
        return Promise.resolve(mediaStreamSource);
    }

    async audioBuffer(audioBuffer: AudioBuffer, analyserNode: AnalyserNode, onended: () => void = () => {}): Promise<AudioNode> {
        const context = this.context;
        const audioBufferSourceNode = context.createBufferSource();
        audioBufferSourceNode.loop = false;
        audioBufferSourceNode.loopStart = 0;
        audioBufferSourceNode.playbackRate.value = 1.0;
        audioBufferSourceNode.onended = onended;
        audioBufferSourceNode.buffer = audioBuffer;
        audioBufferSourceNode.loopEnd = audioBuffer.duration;
        audioBufferSourceNode
            .connect(await this.gainNode())
            .connect(analyserNode)
            .connect(context.destination);
        audioBufferSourceNode.start(0);
        return Promise.resolve(audioBufferSourceNode);
    }

    async gainNode(): Promise<AudioNode> {
        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.05;
        return Promise.resolve(gainNode);
    }
}
