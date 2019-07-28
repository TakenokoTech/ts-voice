import React from 'react';
import ReactDOM from 'react-dom';
import './app.css';

import AutoEffect from './sound/AutoEffect';
import Graph from './components/GraphComponent';
import Waveform from './components/WaveComponent';
import VoiceModel from './model/VoiceModel';
import PlayerLayout from './components/PlayerComponent';
import Grid from './components/GridComponent';
import Track from './components/TrackComponent';

interface AppContainerProps {}

interface AppContainerState {
    model: VoiceModel;
}

class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
    constructor(props: AppContainerProps) {
        super(props);
        const model: VoiceModel = new VoiceModel();
        this.state = {
            model: model,
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
                        <PlayerLayout model={this.state.model} />
                    </div>
                    <div id="waveformLayout" className="content">
                        <Waveform ref="waveform" model={this.state.model} />
                    </div>
                    <div id="effectLayout" className="mini-content row3 border m-3">
                        <Grid model={this.state.model} />
                    </div>
                    <div id="trackLayout" className="big-content row1 border m-3">
                        <Track ref="track" model={this.state.model} />
                    </div>
                </div>
            </div>
        );
    }

    id = setInterval(() => {
        this.setState({ model: this.state.model });
    }, 30);
}

ReactDOM.render(<AppContainer />, document.getElementById('root'));
