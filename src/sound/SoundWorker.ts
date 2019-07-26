import { diffTime } from '../utils/log';

export default class SoundWorker {
    private effectWorker: Worker = new Worker('effectWorker.bundle.js');

    constructor(listen: (response: EffectWorkerMessage) => void) {
        this.effectWorker.addEventListener('message', message => {
            const res = message.data as EffectWorkerMessage;
            // console.log(diffTime('worker', res.timestamp));
            listen(res);
        });
    }

    async post(sound: any, effect: MapList) {
        this.effectWorker.postMessage({ sound: sound, effect: effect, timestamp: performance.now() });
    }
}
