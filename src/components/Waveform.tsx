import React from 'react';
import VoiceModel from '../model/VoiceModel';

interface WaveformProps {
    model: VoiceModel;
}

interface WaveformState {
    width: number;
    height: number;
}

export default class Waveform extends React.Component<WaveformProps, WaveformState> {
    // canvas: HTMLCanvasElement = document.getElementById('waveform') as HTMLCanvasElement;

    canvasContext: CanvasRenderingContext2D | null = null;

    constructor(props: WaveformProps) {
        super(props);
        this.clear = this.clear.bind(this);
        this.update = this.update.bind(this);
        this.state = { width: 0, height: 0 };
    }

    componentDidMount() {
        console.log('Waveform.componentDidMount');
        this.canvasContext = (this.refs.canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
        const waveformLayout: HTMLDivElement = document.getElementById('waveformLayout') as HTMLDivElement;
        this.setState({ width: waveformLayout.offsetWidth, height: waveformLayout.offsetHeight });
    }

    componentDidUpdate(prevProps: WaveformProps, prevState: WaveformState) {
        console.log('Waveform.componentDidUpdate', this.props.model.rawdata.length);
    }

    render() {
        return (
            <div id="waveformBox" className="border" style={{ height: this.state.height }}>
                <canvas id="waveform" ref="canvas" width={this.state.width} height={this.state.height} />
            </div>
        );
    }

    clear(): Waveform {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;
        context.clearRect(0, 0, width, height);
        context.font = '12px serif';
        context.textBaseline = 'middle';

        context.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
        return this;
    }

    update(data: number[]): Waveform {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;

        const len = this.props.model.recordingTime - 1024 * 4;
        const max = 1024 * 32;
        context.beginPath();
        for (let i = 0; i < max; i++) {
            const x = (i / max) * width;
            const y = (data[len - i] * height) / 2 + height / 2;
            context.strokeStyle = 'rgba(255, 0, 0, 0.25)';
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();

        return this;
    }
}
