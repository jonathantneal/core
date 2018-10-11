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

export function getListeners(obj) {
    let props = [];
    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
    } while ((obj = Object.getPrototypeOf(obj)));
    return props.reduce((listeners, prop) => {
        if (/on[A-Z]/.test(prop) && listeners.indexOf(prop) === -1) {
            listeners.push({
                type: prop.replace(/on([A-Z])/, (all, letter) =>
                    letter.toLowerCase()
                ),
                method: prop
            });
        }
        return listeners;
    }, []);
}
