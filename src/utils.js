export function camelCase(string) {
    return string.replace(/-+([\w])/g, (all, letter) => letter.toUpperCase());
}

export function defer(handler) {
    return Promise.resolve().then(handler);
}

export function root(parent) {
    return parent.shadowRoot || parent;
}
export function remove(parent, child) {
    root(parent).removeChild(child);
}

export function append(parent, child) {
    root(parent).appendChild(child);
}

export function replace(parent, newChild, oldChild) {
    root(parent).replaceChild(newChild, oldChild);
}

export function getProps(props) {
    let isArray = Array.isArray(props);
    return {
        keys: (isArray ? props : Object.keys(props)).concat("children"),
        types: isArray ? {} : props
    };
}
