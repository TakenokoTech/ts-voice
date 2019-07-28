import React from 'react';
import ReactDOM from 'react-dom';

import 'web-animations-js';
import 'hammerjs';
import * as Muuri from 'muuri';
import './GridComponent.css';
import BaseComponent from './BaseComponent';
import VoiceModel from '../model/VoiceModel';

interface GridProps {
    model: VoiceModel;
}

interface GridState {
    width: number;
    height: number;
    inputValue: { [key: string]: number };
}

export default class GridComponent extends BaseComponent<GridProps, GridState> {
    grid: any | null;
    gridMap: {
        [key: string]: { enabled: boolean; value: () => number };
    } = {
        lowpass: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['lowpass']) },
        highpass: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['highpass']) },
        bandpass: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['bandpass']) },
        bandstop: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['bandstop']) },
        lowshelf: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['lowshelf']) },
        highshelf: { enabled: false, value: () => Math.pow(2, +this.state.inputValue['highshelf']) },
        pitchshift: { enabled: false, value: () => +this.state.inputValue['pitchshift'] },
        gain: { enabled: true, value: () => +this.state.inputValue['gain'] * 0.1 },
    };

    constructor(props: GridProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        this.onChangeState = this.onChangeState.bind(this);
        this.state = { width: 0, height: 0, inputValue: {} };
    }

    componentDidMount() {
        console.log('Grid.componentDidMount');
        this.grid = new Muuri('.grid', { dragEnabled: true });
        this.onChangeState();
    }

    render() {
        const item = (name: string) => {
            const isEnabled = this.gridMap[name].enabled;
            return (
                <div className={'item ' + (isEnabled ? '' : 'disabled')} key={name} ref={`item-${name}`}>
                    <div className="item-content">
                        <div className="custom-content">
                            <div onClick={() => this.onClick(name)}>{name}</div>
                            <input
                                id={name}
                                type="number"
                                className="form-control"
                                value={this.state.inputValue[name] || 0}
                                onChange={e => this.onChangeInput(name, e)}
                            />
                        </div>
                    </div>
                </div>
            );
        };
        return (
            <div className="">
                <h4 className="text-muted">Filter</h4>
                <div className="grid"> {Object.keys(this.gridMap).map(item)}</div>
            </div>
        );
    }

    onClick(name: string) {
        this.gridMap[name].enabled = !this.gridMap[name].enabled;
        this.onChangeState();
    }

    onChangeInput(name: string, e: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = this.state.inputValue;
        inputValue[name] = +e.target.value;
        this.setState({ inputValue: inputValue });
        this.onChangeState();
    }

    onChangeState() {
        const effectList: MapList = [];
        const items = (this.grid.getItems() as any[]).map(item => item._child.innerText);
        items.forEach(name => {
            if (this.gridMap[name].enabled) effectList.push({ [name]: this.gridMap[name].value() || 0 });
        });
        console.log(`Effect: ${JSON.stringify(effectList)}`);
        this.props.model.effectList = effectList;
    }
}
