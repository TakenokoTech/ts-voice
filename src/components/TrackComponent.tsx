import React from 'react';

import VoiceModel, { ModeType } from '../model/VoiceModel';

interface TrackProps {
    model: VoiceModel;
}

interface TrackState {
    width: number;
    height: number;
    shiftTime: number;
    startLen: number;
}

export default class TrackComponent extends React.Component<TrackProps, TrackState> {
    canvasContext: CanvasRenderingContext2D | null = null;

    constructor(props: TrackProps) {
        super(props);
        this.onMove = this.onMove.bind(this);
        this.onMoveStart = this.onMoveStart.bind(this);
        this.onMoveEnd = this.onMoveEnd.bind(this);
        this.state = { width: 0, height: 0, shiftTime: 0, startLen: 0 };
    }

    componentDidMount() {
        this.canvasContext = (this.refs.canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
        const trackLayout: HTMLDivElement = document.getElementById('trackLayout') as HTMLDivElement;
        (this.refs.canvas as HTMLCanvasElement).addEventListener('mousemove', this.onMove, false);
        (this.refs.canvas as HTMLCanvasElement).addEventListener('mousedown', this.onMoveStart, false);
        (this.refs.canvas as HTMLCanvasElement).addEventListener('mouseup', this.onMoveEnd, false);
        (this.refs.canvas as HTMLCanvasElement).addEventListener('mouseout', this.onMoveEnd, false);
        this.setState({ width: trackLayout.offsetWidth, height: trackLayout.offsetHeight });
    }

    componentDidUpdate(prevProps: TrackProps, prevState: TrackState) {
        if (this.props.model.mode == ModeType.Playing) this.clear().update(this.props.model.rawdata);
    }

    render() {
        return (
            <div id="trackBox" className="" style={{ height: this.state.height }}>
                <canvas id="track" ref="canvas" width={this.state.width} height={this.state.height} />
            </div>
        );
    }

    clear(): TrackComponent {
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

    update(data: number[]): TrackComponent {
        const context = this.canvasContext as CanvasRenderingContext2D;
        const width = (this.refs.canvas as HTMLCanvasElement).width;
        const height = (this.refs.canvas as HTMLCanvasElement).height;
        context.fillStyle = 'rgba(128, 128, 128, 1)';

        const startLen = this.state.startLen;
        const offset = this.state.shiftTime * 256;
        const len = this.props.model.recordingTime;
        const max = 1024 * 800;
        const index = (i: number) => (offset == 0 ? len - i : startLen - i - offset);

        for (let i = 0; i < max; i = i + 128) {
            if (index(i) % (1024 * 64) == 0) {
                context.beginPath();
                const x = (i / max) * width;
                context.strokeStyle = 'rgba(128, 128, 128, 0.1)';
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
                const num = index(i) / 1024 / 64;
                const str = ('          ' + Math.floor(num)).substr(-4);
                context.fillText(`${str}`, x - 12, height - 18);
            }
        }

        context.beginPath();
        for (let i = 0; i < max; i = i + 128) {
            const x = (i / max) * width;
            const y = (data[index(i)] * height) / 2 + height / 2;
            context.strokeStyle = 'rgba(0, 0, 255, 0.25)';
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();

        if (offset != 0) {
            context.fillStyle = 'rgba(0,128,0,0.5)';
            context.strokeStyle = 'rgba(0, 0, 0, 0)';
            context.beginPath();
            context.moveTo(width - 20, 32);
            context.lineTo(width - 48, 16);
            context.lineTo(width - 48, 48);
            context.closePath();
            context.fill();
            context.stroke();
        }

        return this;
    }

    dragging = false;
    objX = 0;
    objY = 0;

    private onMove(e: MouseEvent) {
        const x = e.clientX - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().left;
        const y = e.clientY - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().top;
        if (this.dragging) {
            const moveX = this.objX - x;
            this.setState({ shiftTime: Math.max(0, moveX) });
        }
    }

    private onMoveStart(e: MouseEvent) {
        const eventX = e.clientX - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().left;
        const eventY = e.clientY - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().top;
        const targetX = (this.refs.canvas as HTMLCanvasElement).width - (48 + 20) / 2;
        const targetY = 32;
        if (this.distance({ x: eventX, y: eventY }, { x: targetX, y: targetY }, 10)) {
            this.setState({ shiftTime: 0 });
            this.dragging = false;
            return;
        }

        this.objX = e.clientX - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().left + this.state.shiftTime;
        this.objY = e.clientY - (this.refs.canvas as HTMLCanvasElement).getBoundingClientRect().top;
        this.setState({ startLen: this.state.shiftTime == 0 ? this.props.model.recordingTime : this.state.startLen });
        this.dragging = true;
    }

    private onMoveEnd(e: MouseEvent) {
        this.dragging = false;
    }

    private distance(a: { x: number; y: number }, b: { x: number; y: number }, dis: number): boolean {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) < dis;
    }
}
