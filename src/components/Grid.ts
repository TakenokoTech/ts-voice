import 'web-animations-js';
import 'hammerjs';
import * as Muuri from 'muuri';
import './Grid.css';
import BaseComponent from './BaseComponent';

class Grid extends BaseComponent {
    grid: any | null;
    gridMap: {
        [key: string]: { enabled: boolean; value: () => number };
    } = {
        lowpass: { enabled: false, value: () => Math.pow(2, +this.iElement['lowpass'].value) },
        highpass: { enabled: false, value: () => Math.pow(2, +this.iElement['highpass'].value) },
        bandpass: { enabled: false, value: () => Math.pow(2, +this.iElement['bandpass'].value) },
        bandstop: { enabled: false, value: () => Math.pow(2, +this.iElement['bandstop'].value) },
        lowshelf: { enabled: false, value: () => Math.pow(2, +this.iElement['lowshelf'].value) },
        highshelf: { enabled: false, value: () => Math.pow(2, +this.iElement['highshelf'].value) },
        pitchshift: { enabled: false, value: () => +this.iElement['pitchshift'].value },
    };
    filterList: MapList = [];

    private makeCustom = (name: string, onclick: () => void) => {
        const nameSpan = this.makeDiv('', '', `${name}`);
        nameSpan.onclick = onclick;
        const custom = this.makeDiv('', 'custom-content');
        custom.innerHTML = `<input id="${name}" type="number" class="form-control" value="0"/>`;
        custom.insertBefore(nameSpan, custom.firstChild);
        return custom;
    };

    constructor() {
        super();
        this.muuri = this.muuri.bind(this);
        this.onChangeState = this.onChangeState.bind(this);
        this.muuri();
    }

    muuri() {
        const gridMap = this.gridMap;
        this.element['grid'] = document.getElementsByClassName('grid')[0] as HTMLElement;
        while (this.element['grid'].firstChild) this.element['grid'].removeChild(this.element['grid'].firstChild);
        Object.keys(gridMap).forEach(name => {
            this.element['grid'].appendChild(
                ((name: string): HTMLDivElement => {
                    const isEnabled = this.gridMap[name].enabled;
                    const itemDom = this.makeDiv('', 'item ' + (isEnabled ? '' : 'disabled'));
                    const content = this.makeDiv('', 'item-content');
                    const onclick = () => {
                        itemDom.classList.toggle('disabled');
                        this.gridMap[name].enabled = !itemDom.classList.contains('disabled');
                        this.onChangeState();
                    };
                    const custom = this.makeCustom(name, onclick);
                    content.appendChild(custom);
                    itemDom.appendChild(content);
                    return itemDom;
                })(name),
            );
            this.iElement[name] = document.getElementById(name) as HTMLInputElement;
            this.iElement[name].onchange = this.onChangeState;
        });
        this.grid = new Muuri('.grid', { dragEnabled: true });
    }

    onChangeState() {
        console.log('onChangeState');
        this.filterList = [];
        const items = (this.grid.getItems() as any[]).map(item => item._child.innerText);
        items.forEach(name => {
            if (this.gridMap[name].enabled)
                this.filterList.push({
                    [name]: this.gridMap[name].value() || 0,
                });
        });
        console.log(JSON.stringify(this.filterList));
    }

    getFilterList(): MapList {
        return this.filterList;
    }
}

export default new Grid();
