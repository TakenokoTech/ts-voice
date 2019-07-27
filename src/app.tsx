import React from 'react';
import ReactDOM from 'react-dom';
import './app.css';

import AutoEffect from './sound/AutoEffect';
import Graph from './components/Graph';
import Waveform from './components/Waveform';
import VoiceModel from './model/VoiceModel';
import PlayerLayout from './components/PlayerLayout';
import Grid from './components/Grid';

interface AppContainerProps {}

interface AppContainerState {
    model: VoiceModel;
    autoEffect: AutoEffect;
}

class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
    constructor(props: AppContainerProps) {
        super(props);
        const model: VoiceModel = new VoiceModel();
        this.state = {
            model: model,
            autoEffect: new AutoEffect(model),
        };
    }

    render() {
        return (
            <div className="container p-3">
                <div className="wrapper">
                    <div id="graphLayout" className="content">
                        <Graph ref="graph" model={this.state.model} />
                    </div>
                    <div id="playerLayout" className="mini-content row1 border m-3">
                        <PlayerLayout effect={this.state.autoEffect} />
                    </div>
                    <div id="waveformLayout" className="content">
                        <Waveform ref="waveform" model={this.state.model} />
                    </div>
                    <div id="effectLayout" className="mini-content row3 border m-3">
                        <Grid model={this.state.model} />
                    </div>
                </div>
            </div>
        );
    }

    id = setInterval(() => {
        const model = this.state.model;
        const graph = this.refs.graph as Graph;
        const waveform = this.refs.waveform as Waveform;
        if (!model.analyserNode || !model.analyserPlayNode) {
            return;
        }
        model.analyserNode.minDecibels = -150;
        model.analyserNode.maxDecibels = -30;
        const recordFrequencyData = new Uint8Array(model.analyserNode.frequencyBinCount);
        const recordTimeDomainData = new Uint8Array(model.analyserNode.frequencyBinCount);
        const recordFrequencyFloatData = new Float32Array(model.analyserNode.frequencyBinCount);
        const recordTimeDomainFloatData = new Float32Array(model.analyserNode.frequencyBinCount);
        model.analyserNode.getByteFrequencyData(recordFrequencyData);
        model.analyserNode.getByteTimeDomainData(recordTimeDomainData);
        model.analyserNode.getFloatFrequencyData(recordFrequencyFloatData);
        model.analyserNode.getFloatTimeDomainData(recordTimeDomainFloatData);
        const playFrequencyData = new Uint8Array(model.analyserPlayNode.frequencyBinCount);
        const playTimeDomainData = new Uint8Array(model.analyserPlayNode.frequencyBinCount);
        const playFrequencyFloatData = new Float32Array(model.analyserPlayNode.frequencyBinCount);
        const playTimeDomainFloatData = new Float32Array(model.analyserPlayNode.frequencyBinCount);
        model.analyserPlayNode.getByteFrequencyData(playFrequencyData);
        model.analyserPlayNode.getByteTimeDomainData(playTimeDomainData);
        model.analyserPlayNode.getFloatFrequencyData(playFrequencyFloatData);
        model.analyserPlayNode.getFloatTimeDomainData(playTimeDomainFloatData);
        if (recordFrequencyFloatData[0] > -120 || playFrequencyFloatData[0] > -120) {
            graph
                .clear()
                .update(recordFrequencyData, recordTimeDomainData, recordFrequencyFloatData, recordTimeDomainFloatData, 0)
                .update(playFrequencyData, playTimeDomainData, playFrequencyFloatData, playTimeDomainFloatData, 1);
        }
        if (model.rawdata) {
            waveform.clear().update(model.rawdata);
        }
    }, 10);
}

ReactDOM.render(<AppContainer />, document.getElementById('root'));
