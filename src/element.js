import { ELEMENT, MASTER } from "./constants";
import { h, isVDom } from "./vdom";
import { diff } from "./diff";
import { defer, camelCase, append } from "./utils";

export default class extends HTMLElement {
    constructor() {
        super();

        this[ELEMENT] = true;

        this.slots = {};
        this.props = {};
        this.preventRender = true;
        this.content = document.createDocumentFragment();

        this.class = this.constructor;
        this._props = {
            keys: this.class.observedAttributes,
            types: this.class.props
        };
    }
    static get props() {
        return {};
    }
    static get observedAttributes() {
        return Object.keys(this.props).concat("children");
    }
    get isMount() {
        return this[MASTER];
    }
    connectedCallback() {
        defer(() => {
            let children = [];
            while (this.firstChild) {
                let child = this.firstChild,
                    slot = child.getAttribute && child.getAttribute("slot");
                if (slot) {
                    this.slots[slot] = child;
                }
                append(this.content, child);
                children.push(child);
            }
            this.setProperties({ children });
            this.preventRender = false;
            this.setState({});
        });
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
    attributeChangedCallback(index, prev, next) {
        this.setProperties({ [index]: next });
    }
    disconnectedCallback() {
        this.elementMount();
    }
    setState(state) {
        if (typeof state !== "object") return;
        this.state = { ...this.state, ...state };
        if (this.preventRender) return;
        this.preventRender = true;
        defer(() => {
            let render = this.render(),
                isMount = this.isMount;
            render =
                isVDom(render) && render.tag === "host" ? (
                    render
                ) : (
                    <host>{render}</host>
                );

            diff(false, this, render, this.slots);
            this.preventRender = false;
            isMount ? this.elementUpdate() : this.elementMount();
        });
    }
    elementMount() {}
    elementUnmount() {}
    elementUpdate() {}
    elementReceiveProps() {}
    render() {}
}
