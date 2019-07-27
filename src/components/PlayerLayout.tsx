import React from 'react';
import AutoEffect from '../sound/AutoEffect';

enum ModeType {
    Stopping,
    Playing,
}

const inputStyle: React.CSSProperties = { borderRadius: '0px' };

interface PlayerLayoutProps {
    effect: AutoEffect;
}

interface PlayerLayoutState {
    mode: ModeType;
}

export default class PlayerLayout extends React.Component<PlayerLayoutProps, PlayerLayoutState> {
    constructor(props: PlayerLayoutProps) {
        super(props);
        this.state = { mode: ModeType.Stopping };
    }

    componentDidMount() {}

    render() {
        return (
            <div className="">
                <h4 className="text-muted">Player</h4>
                <span id="recBox" style={{ display: 'block' }}>
                    <div className="alert alert-success" role="alert">
                        TIME: <span id="playTime">{0}</span>
                    </div>
                    <input
                        type="button"
                        className="btn btn-success btn-block"
                        value="Rec"
                        style={inputStyle}
                        disabled={this.state.mode != ModeType.Stopping}
                        onClick={this.onCkickToRecBtn}
                    />
                </span>
                <span id="stopBox" style={{ display: 'none' }}>
                    <div className="alert alert-danger" role="alert">
                        TIME: <span id="recTime">{0}</span>
                    </div>
                    <input type="button" id="stopBtn" className="btn btn-danger btn-block" value="Stop" style={inputStyle} />
                </span>
            </div>
        );
    }

    private onCkickToRecBtn = () => {
        console.log('this.onCkickToRecBtn');
        this.setState({ mode: ModeType.Playing });
        this.props.effect.start();
        this.props.effect.play();
        this.props.effect.effect();
    };
}
