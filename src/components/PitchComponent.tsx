import React from 'react';

import VoiceModel, { ModeType } from '../model/VoiceModel';

const pitchList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// const pitchList = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ファ', 'ファ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'];
const d: number = 2.0 ** (1.0 / 12.0);
const baseC = 27.5 * d ** 3;

interface PitchProps {
    model: VoiceModel;
}

interface PitchState {
    width: number;
    height: number;
}

export default class PitchComponent extends React.Component<PitchProps, PitchState> {
    canvasContext: CanvasRenderingContext2D | null = null;
    pitchList: number[] = [];

    constructor(props: PitchProps) {
        super(props);
        this.state = { width: 0, height: 0 };
    }

    componentDidMount() {
        this.canvasContext = (this.refs.canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
        const pitchLayout: HTMLDivElement = document.getElementById('pitchLayout') as HTMLDivElement;
        this.setState({ width: pitchLayout.offsetWidth, height: pitchLayout.offsetHeight });
    }

    componentDidUpdate(prevProps: PitchProps, prevState: PitchState) {
        // if (this.props.model.mode == ModeType.Playing) this.clear().update(this.props.model.rawdata);
        const rData = this.props.model.analyserRecordingData;
        const pData = this.props.model.analyserPlayingData;
        const arr = rData.frequencyFloatData.map(v => v).map((v, i) => (i < 64 ? v : -1000));
        const reduceMax = arr.reduce((a, b) => (a > b ? a : b));
        const max = (44100 / 1024 / 2) * arr.indexOf(reduceMax);
        // Prev Check
        const p = this.pitch(max);
        const pre = this.pitch(this.pitchList[this.pitchList.length - 1]);
        if (pre.code != p.code) {
            this.pitchList[this.pitchList.length - 1] = 0;
        }
        // Current Check
        if (reduceMax > -60) {
            this.pitchList.push(max);
        } else {
            this.pitchList.push(0);
        }
        this.clear().update(this.pitchList);
    }

    render() {
        return (
            <div id="pitchBox" className="" style={{ height: this.state.height }}>
                <canvas id="pitch" ref="canvas" width={this.state.width} height={this.state.height} />
            </div>
        );
    }

    clear(): PitchComponent {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;
        context.clearRect(0, 0, width, height);
        context.font = '12px serif';
        context.textBaseline = 'middle';
        context.strokeStyle = 'rgba(128, 128, 128, 0.05)';

        for (let i = 0, len = 14; i <= len; i++) {
            context.beginPath();
            context.moveTo(0, (height * i) / len);
            context.lineTo(width, (height * i) / len);
            context.stroke();
        }

        for (let i = 0, len = 12; i < len; i++) {
            const p = this.pitch(baseC * 2 ** i);
            context.fillText(`${pitchList[i]}`, width - 36, height - (height * i) / 12 - height / 24);
        }

        return this;
    }

    update(data: number[]): PitchComponent {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;
        context.fillStyle = 'rgba(128, 128, 128, 1)';

        const max = 60;
        for (let i = 0; i <= max; i++) {
            const tone = this.pitch(data[data.length - i - 1]).tone;
            const x = (i / max) * width;
            const y = ((12 - tone) * height) / (12 + 2) + height / 12;
            context.strokeStyle = 'rgba(0, 0, 255, 0.25)';
            context.beginPath();
            context.arc(x, y, 8, 0, Math.PI * 2, true);
            context.fill();
            context.stroke();
        }

        return this;
    }

    private pitch(f: number): { tone: number; octo: number; code: string } {
        const log2 = Math.log2(f / baseC) * 12;
        const p = Math.round(log2);
        return {
            tone: Math.round(p % 12),
            octo: Math.floor(p / 12 + 1),
            code: pitchList[p % 12], // + Math.floor(p / 12 + 1),
        };
    }
}
