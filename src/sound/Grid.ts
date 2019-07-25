import "web-animations-js";
import "hammerjs";
import * as Muuri from "muuri";

const highpassDom = document.getElementById("highpass") as HTMLInputElement;
const lowpassDom = document.getElementById("lowpass") as HTMLInputElement;
const pitchShiftDom = document.getElementById("shift") as HTMLInputElement;

const _gridMap = {
    lowpass: { enabled: false, value: () => Math.pow(2, +lowpassDom.value) },
    highshelf: { enabled: false, value: () => Math.pow(2, +highpassDom.value) },
    pitchshift: { enabled: false, value: () => +pitchShiftDom.value }
};

class Grid {
    grid: any | null;
    gridDom = document.getElementsByClassName("grid")[0];
    gridMap: { [key: string]: { enabled: boolean; value: () => number } } = _gridMap;
    filterList: MapList = [];

    constructor() {
        this.onChangeState = this.onChangeState.bind(this);
        const gridMap = this.gridMap;
        const createItem = (name: string): HTMLDivElement => {
            const itemDom = document.createElement("div");
            itemDom.className = "item";
            const content = document.createElement("div");
            content.className = "item-content";
            itemDom.appendChild(content);
            const custom = document.createElement("div");
            custom.className = "custom-content disabled";
            custom.innerHTML = name;
            custom.onclick = () => {
                gridMap[name].enabled = !gridMap[name].enabled;
                custom.className = gridMap[name].enabled ? "custom-content" : "custom-content disabled";
                this.onChangeState();
            };
            content.appendChild(custom);
            return itemDom;
        };
        Object.keys(gridMap).forEach(name => {
            this.gridDom.appendChild(createItem(name));
        });
        this.grid = new Muuri(".grid", {
            dragEnabled: true
        });

        //
        pitchShiftDom.onchange = this.onChangeState;
    }

    onChangeState() {
        this.filterList = [];
        const items = (this.grid.getItems() as any[]).map(item => item._child.innerText);
        items.forEach(name => {
            if (this.gridMap[name].enabled) this.filterList.push({ [name]: this.gridMap[name].value() || 0 });
        });
        console.log(JSON.stringify(this.filterList));
    }

    getFilterList(): MapList {
        return this.filterList;
    }
}

export default new Grid();
