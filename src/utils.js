export function camelCase(string) {
    return string.replace(/-+([\w])/g, (all, letter) => letter.toUpperCase());
}

export function defer(handler) {
    return Promise.resolve().then(handler);
}

export function getProps(props) {
    let isArray = Array.isArray(props);
    return {
        keys: (isArray ? props : Object.keys(props)).concat("children"),
        types: isArray ? {} : props
    };
}
