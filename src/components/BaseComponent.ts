export default class BaseComponent {
    element: { [key: string]: HTMLElement } = {};
    iElement: { [key: string]: HTMLInputElement } = {};
    constructor() {}

    makeSpan = (id: string = '', className: string = '', innerHTML = '') => {
        const content = document.createElement('span');
        content.id = id;
        content.className = className;
        content.innerHTML = innerHTML;
        return content;
    };

    makeDiv = (id: string = '', className: string = '', innerHTML = '') => {
        const content = document.createElement('div');
        content.id = id;
        content.className = className;
        content.innerHTML = innerHTML;
        return content;
    };
}
