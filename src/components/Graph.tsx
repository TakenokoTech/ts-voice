import React from 'react';
import VoiceModel from '../model/VoiceModel';

interface GraphProps {
    model: VoiceModel;
}

interface GraphState {
    width: number;
    height: number;
    divided: number;
}

export default class Graph extends React.Component<GraphProps, GraphState> {
    canvasContext: CanvasRenderingContext2D | null = null;
    color = [['rgba(230, 0, 18, 0.8)', 'rgba(0, 167, 219, 0.8)'], ['rgba(0, 173, 169, 0.8)', 'rgba(243, 151, 0, 0.8)']];

    constructor(props: GraphProps) {
        super(props);
        this.clear = this.clear.bind(this);
        this.update = this.update.bind(this);
        this.state = { width: 0, height: 0, divided: 1 };
    }

    componentDidMount() {
        console.log('Graph.componentDidMount');
        this.canvasContext = (this.refs.canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
        const graphLayout: HTMLDivElement = document.getElementById('graphLayout') as HTMLDivElement;
        this.setState({ width: graphLayout.offsetWidth, height: graphLayout.offsetHeight });
    }

    render() {
        return (
            <div id="playerBox" className="border" style={{ height: this.state.height }}>
                <canvas id="soundChart" ref="canvas" width={this.state.width} height={this.state.height} />
            </div>
        );
    }

    clear(): Graph {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;

        const samplerate = 44100 / this.state.divided;
        context.clearRect(0, 0, width, height);
        context.font = '12px serif';
        context.textBaseline = 'middle';

        context.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();

        context.beginPath();
        context.moveTo(width / 2, 0);
        context.lineTo(width / 2, height);
        context.stroke();
        context.fillText(`${Math.floor(samplerate / 4)}`, width / 2 - 18, height - 18);

        context.beginPath();
        context.moveTo(width / 4, 0);
        context.lineTo(width / 4, height);
        context.stroke();
        context.fillText(`${Math.floor(samplerate / 8)}`, width / 4 - 18, height - 18);

        context.beginPath();
        context.moveTo(width / 8, 0);
        context.lineTo(width / 8, height);
        context.stroke();
        context.fillText(`${Math.floor(samplerate / 16)}`, width / 8 - 14, height - 18);

        context.beginPath();
        context.moveTo(width / 16, 0);
        context.lineTo(width / 16, height);
        context.stroke();
        context.fillText(`${Math.floor(samplerate / 32)}`, width / 16 - 14, height - 18);

        context.font = '16px serif';
        context.fillText(' -30dB', width - 60, 18);
        context.fillText(' -90dB', width - 60, height / 2);
        context.fillText('-150dB', width - 60, height - 18);

        context.fillText(' 1', 4, 18);
        context.fillText(' 0', 4, height / 2);
        context.fillText('-1', 4, height - 18);

        /*
        const high = +$("#highpass").val();
        context.strokeStyle = "#0079c266";
        context.beginPath();
        context.moveTo(Math.pow(2, high) * (width / 512), 0);
        context.lineTo(Math.pow(2, high) * (width / 512), height);
        context.stroke();
        */

        /*
        const low = +$("#lowpass").val();
        context.strokeStyle = "#6cbb5a66";
        context.beginPath();
        context.moveTo(Math.pow(2, low) * (width / 512), 0);
        context.lineTo(Math.pow(2, low) * (width / 512), height);
        context.stroke();
        */

        return this;
    }

    update(frequencyData: Uint8Array, timeDomainData: Uint8Array, frequencyFloatData: Float32Array, timeDomainFloatData: Float32Array, no = 0): Graph {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;

        frequencyFloatData = frequencyFloatData.slice(0, frequencyFloatData.length / this.state.divided);
        timeDomainFloatData = timeDomainFloatData.slice(0, timeDomainFloatData.length / this.state.divided);

        context.beginPath();
        for (var i = 0, len = frequencyFloatData.length; i < len; i++) {
            var x = (i / len) * width;
            var y = ((-frequencyFloatData[i] - 30) * height) / 120;
            context.strokeStyle = this.color[no][0];
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();

        context.beginPath();
        for (var i = 0, len = timeDomainFloatData.length; i < len; i++) {
            var x = (i / len) * width;
            var y = (timeDomainFloatData[i] * height) / 2 + height / 2;
            context.strokeStyle = this.color[no][1];
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();

        return this;
    }
}
