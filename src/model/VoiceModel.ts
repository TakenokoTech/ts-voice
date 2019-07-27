export default class VoiceModel {
    analyserPlayNode: AnalyserNode | null = null;
    analyserNode: AnalyserNode | null = null;
    recordingTime: number = 0;
    rawdata: [] = [];
    effectList: MapList = [];
}
