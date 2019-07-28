import React from 'react';
import AutoEffect from '../sound/AutoEffect';
import VoiceModel, { ModeType } from '../model/VoiceModel';

const inputStyle: React.CSSProperties = { borderRadius: '0px' };

interface PlayerLayoutProps {
    model: VoiceModel;
}

interface PlayerLayoutState {
    mode: ModeType;
}

export default class PlayerComponent extends React.Component<PlayerLayoutProps, PlayerLayoutState> {
    constructor(props: PlayerLayoutProps) {
        super(props);
        this.state = { mode: ModeType.Stopping };
    }

    componentDidMount() {}

    render() {
        return (
            <div className="">
                <h4 className="text-muted">Player</h4>
                <span id="startBox" style={{ display: this.state.mode == ModeType.Stopping ? 'block' : 'none' }}>
                    <div className="alert alert-success" role="alert">
                        TIME: <span id="playTime">{0}</span>
                    </div>
                    <input
                        type="button"
                        className="btn btn-success btn-block"
                        value="Start"
                        style={inputStyle}
                        disabled={this.state.mode != ModeType.Stopping}
                        onClick={this.onCkickToStartBtn}
                    />
                </span>
                <span id="stopBox" style={{ display: this.state.mode == ModeType.Playing ? 'block' : 'none' }}>
                    <div className="alert alert-danger" role="alert">
                        TIME: <span id="playTime">{0}</span>
                    </div>
                    <input
                        type="button"
                        className="btn btn-danger btn-block"
                        value="Stop"
                        style={inputStyle}
                        disabled={this.state.mode != ModeType.Playing}
                        onClick={this.onClickStopBtn}
                    />
                </span>
            </div>
        );
    }

    private onCkickToStartBtn = () => {
        this.props.model.mode = ModeType.Playing;
        this.props.model.start();
        this.setState({ mode: this.props.model.mode });
    };

    private onClickStopBtn = () => {
        this.props.model.mode = ModeType.Stopping;
        this.props.model.stop();
        this.setState({ mode: this.props.model.mode });
    };
}
