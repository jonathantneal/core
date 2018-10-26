import { h, diff, isVDom, Collect, Context } from "atomico-diff";
import { getProps, defer, camelCase } from "./utils";

export { h } from "atomico-diff";

export class Element extends HTMLElement {
    constructor() {
        super();
        this.props = {};
        this.slots = {};
        this.state = {};
        this.preventRender = true;
        this.is = this.nodeName.toLocaleLowerCase();
        this._props = getProps(this.constructor.props);
        new Collect(this, this._props.keys, props => this.setProperties(props));
        new Context(this, context => this.getContext(context));
    }
    get content() {
        return this.shadowRoot || this;
    }
    static get props() {
        return [];
    }
    static get observedAttributes() {
        return getProps(this.props).keys;
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
            prevent = this.isMounted;
        for (let prop in props) {
            let type = this._props.types[prop],
                value = props[prop],
                index;
            value = type ? type(value) : value;
            index = camelCase(prop);
            if (value !== this.props[index]) {
                nextProps[index] = value;
            }
        }
        if (Object.keys(nextProps).length) {
            if (prevent) prevent = this.onUpdate(nextProps) !== false;
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
            render =
                isVDom(render) && render.tag === "host"
                    ? render
                    : h("host", {}, render);

            diff(false, this, render.clone(this.is), this.slots, this.context);
            this.preventRender = false;
            watch ? watch() : this.onUpdated();
        });
    }
    connectedCallback() {
        defer(() => {
            let fragment = document.createDocumentFragment();
            while (this.firstChild) {
                let child = this.firstChild,
                    slot = child.getAttribute && child.getAttribute("slot");
                if (slot) {
                    this.slots[slot] = child;
                }
                fragment.appendChild(child);
            }
            this.preventRender = false;
            this.setState({}, () => {
                this.isMounted = true;
                this.onMounted();
            });
        });
    }
    disconnectedCallback() {
        this.onUnmounted();
    }
    attributeChangedCallback(index, prev, next) {
        if (prev !== next) this.setProperties({ [index]: next });
    }
    getContext() {}
    onMounted() {}
    onUpdate() {}
    onUnmounted() {}
    onUpdated() {}
    render() {}
}
