export default class SoundWorker {
    private effectWorker: Worker = new Worker("effectWorker.bundle.js");

    constructor(listen: (message: MessageEvent) => void) {
        this.effectWorker.addEventListener("message", listen);
    }

    async post(sound: any, effect: MapList) {
        this.effectWorker.postMessage({ sound: sound, effect: effect });
    }
}
