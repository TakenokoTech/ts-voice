import React from 'react';

export default class BaseComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    element: { [key: string]: HTMLElement } = {};
    iElement: { [key: string]: HTMLInputElement } = {};

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
