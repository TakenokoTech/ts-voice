import { Repository } from "../app";

export default class Waveform {
    canvas: HTMLCanvasElement = document.getElementById("waveform") as HTMLCanvasElement;
    waveformBox: HTMLDivElement = document.getElementById("waveformBox") as HTMLDivElement;
    canvasContext: CanvasRenderingContext2D;

    constructor(private repository: Repository) {
        this.canvas.setAttribute("width", `${this.waveformBox.clientWidth}`);
        this.canvas.setAttribute("height", `${this.waveformBox.clientHeight}`);
        this.canvasContext = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.update = this.update.bind(this);
    }

    clear(): Waveform {
        const context = this.canvasContext;
        const width = this.canvas.width;
        const height = this.canvas.height;
        context.clearRect(0, 0, width, height);
        context.font = "12px serif";
        context.textBaseline = "middle";

        context.strokeStyle = "rgba(128, 128, 128, 0.3)";
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
        return this;
    }

    update(data: number[]) {
        const context = this.canvasContext;
        const width = this.canvas.width;
        const height = this.canvas.height;

        const len = this.repository.model.recordingTime - 1024 * 4;
        const max = 1024 * 32;
        context.beginPath();
        for (let i = 0; i < max; i++) {
            const x = (i / max) * width;
            const y = (data[len - i] * height) / 2 + height / 2;
            context.strokeStyle = "rgba(255, 0, 0, 0.25)";
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.stroke();
        /*
        for (let i = 0; i < max; i++) {
            const x = (i / max) * width;
            const y = Math.abs(data[len - i]) * 100;
            context.strokeStyle = "rgba(0, 0, 255, 0.25)";
            context.beginPath();
            context.moveTo(x, height);
            context.lineTo(x, height - (y > 1 ? 100 : 0));
            context.stroke();
        }
        */
    }
}
