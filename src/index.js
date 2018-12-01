import { createRender } from "./diff";
export { h, createRender } from "./diff";

function camelCase(string) {
    return string.replace(/-+([\w])/g, (all, letter) => letter.toUpperCase());
}
function unCamelCase(string) {
    return string.replace(
        /([^\-])([A-Z]+)/,
        (all, before, after) => before + "-" + after.toLowerCase()
    );
}
/**
 * @param {object|array} props - allows you to generate an object that contains the props to be observed by the component and the type functions
 * @return {object}
 */
function getProps(props) {
    let isArray = Array.isArray(props),
        keys = [],
        types = {};
    for (let key in props) {
        let prop = unCamelCase(isArray ? props[key] : key);
        if (isArray) {
            keys.push(prop);
        } else {
            keys.push(prop);
            types[prop] = props[key];
            types[camelCase(key)] = props[key];
        }
    }
    return {
        keys,
        types
    };
}

export class Element extends HTMLElement {
    constructor() {
        super();

        let render = createRender(this),
            resolve;

        this.props = {};
        this.countRender = 0;
        this.preventRender = true;
        this.proxy = getProps(this.constructor.props);

        this.load = () => {
            this.preventRender = false;
            resolve();
        };

        this.await = new Promise(load => (resolve = load));

        this.rerender = state => {
            if (this.preventRender) return;
            this.preventRender = true;
            Promise.resolve().then(() => {
                render(this.render());
                this.preventRender = false;
                this.countRender++ ? this.onUpdated() : this.onMounted();
            });
        };

        this.proxy.keys.forEach(key => {
            key = camelCase(key);
            Object.defineProperty(this, key, {
                set(value) {
                    this.setProps({ [key]: value });
                },
                get() {
                    return this.props[key];
                }
            });
        });
    }
    static get props() {
        return [];
    }
    render() {}
    onMounted() {}
    onUpdated() {}
    onUnmounted() {}
    setProps(props) {
        let nextProps = {},
            nextRender;
        for (let key in props) {
            let prevValue = this.props[key];
            if (props[key] !== prevValue) {
                let type = this.proxy.types[key],
                    nextValue = type ? type(props[key], prevValue) : props[key];
                if (nextValue !== prevValue) {
                    nextProps[key] = nextValue;
                    nextRender = true;
                }
            }
        }
        if (nextRender) {
            this.props = { ...this.props, ...nextProps };
            this.rerender();
        }
    }
    setAttribute(prop, value) {
        if (this.proxy.keys.indexOf(prop) > -1) {
            this.setProps({ [camelCase(prop)]: value });
        } else {
            super.setAttribute(prop, value);
        }
    }
    static get observedAttributes() {
        return getProps(this.props).keys;
    }
    connectedCallback() {
        this.load();
        this.await.then(() => this.rerender());
    }
    disconnectedCallback() {
        this.await.then(() => this.onUnmounted());
    }
    attributeChangedCallback(name, prev, next) {
        this.setProps({ [name]: next });
    }
}
