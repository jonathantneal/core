import { ELEMENT, MASTER } from "./constants";
import { h, isVDom } from "./vdom";
import { diff } from "./diff";
import { defer, camelCase, append, getProps } from "./utils";

export default class extends HTMLElement {
    constructor() {
        super();

        this[ELEMENT] = true;

        this.slots = {};
        this.props = { children: [] };
        this.isMount = false;
        this.preventRender = true;
        this.content = document.createDocumentFragment();

        this._class = this.constructor;
        this._name = this.tagName.toLocaleLowerCase();
        this._props = getProps(this._class.props);
    }
    static get props() {
        return {};
    }
    static get observedAttributes() {
        return getProps(this.props).keys;
    }
    connectedCallback() {
        defer(() => {
            while (this.firstChild) {
                let child = this.firstChild,
                    slot = child.getAttribute && child.getAttribute("slot");
                if (slot) {
                    this.slots[slot] = child;
                }
                append(this.content, child);
            }
            this.preventRender = false;
            this.setState({}, () => {
                this.isMount = true;
                this.elementMount();
            });
        });
    }
    disconnectedCallback() {
        this.elementUnmount();
    }
    attributeChangedCallback(index, prev, next) {
        this.setProperties({ [index]: next });
    }
    setAttribute(prop, value) {
        if (this._props.keys.indexOf(prop) > -1) {
            this.setProperties({ [prop]: value });
        } else {
            super.setAttribute(prop, value);
        }
    }
    setProperties(props) {
        let nextProps = {},
            prevent = this.isMount;
        for (let prop in props) {
            let type = this._props.types[prop],
                value = props[prop],
                index;
            if (type) {
                value = type(value);
            }
            index = camelCase(prop);
            if (value !== this.props[index]) {
                nextProps[index] = value;
            }
        }
        if (Object.keys(nextProps).length) {
            if (prevent)
                prevent = this.elementReceiveProps(nextProps) !== false;
            this.props = { ...this.props, ...nextProps };
            if (prevent) this.setState({});
        }
    }
    setState(state, watch) {
        if (typeof state !== "object") return;
        this.state = { ...this.state, ...state };
        if (this.preventRender) return;
        this.preventRender = true;
        defer(() => {
            let render = this.render();

            if (isVDom(render)) {
                let isHost = render.tag === "host";
                render = h(
                    this._name,
                    isHost ? render.props : {},
                    isHost ? render.children : render
                );
            } else {
                render = h(this._name, {}, render);
            }

            diff(false, this, render, this.slots);
            this.preventRender = false;
            watch ? watch() : this.elementUpdate();
        });
    }
    elementMount() {}
    elementUnmount() {}
    elementUpdate() {}
    elementReceiveProps() {}
    render() {}
}
