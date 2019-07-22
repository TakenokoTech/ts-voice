export default class SoundWorker {
    private effectWorker: Worker = new Worker("effectWorker.bundle.js");

    constructor(listen: (message: MessageEvent) => void) {
        this.effectWorker.addEventListener("message", listen);
    }

    async post(message: any) {
        this.effectWorker.postMessage(message /*, ["bandpass"]]*/);
    }
}
