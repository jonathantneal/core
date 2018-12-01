import { remove, append, replace, create } from "./dom";
import { VDom, h, isVDom } from "./vdom";

export let PREVIOUS = "__PREVIOUS__";
export let LISTENERS = "__LISTENERS__";

export function createRender(root) {
    let localName = root.tagName.toLowerCase();
    root[PREVIOUS] = h(localName);
    return next => {
        if (isVDom(next) && next.tag === "host") {
            next = next.clone(localName);
        } else {
            next = h(localName, {}, next);
        }
        diff(root, root, root, next);
    };
}
/**
 * Analyze if prev Node has or does not have a state defined by the diff process,
 * this is left linked to the node to avoid its loss either by external editing.
 *
 * @param {HTMLELement} [parent] - If the father is defined, the remove function is activated,
 *                                 it allows to remove the nodes from the father
 * @param {HTMLELement} [prevNode] - Node that can possess the previous state
 * @param {Object} next - Next render state
 * @param {Object} slots - Group the slots to be retrieved by the special slot tag
 * @param {*} context - allows to share information within the children of the component
 * @param {Boolean} svg - define if the html element is a svg
 * @return {HTMLELement} - returns the current node.
 */

export function diff(root, parent, node, next, isSvg, deep) {
    let prev = (node && node[PREVIOUS]) || new VDom(),
        base = node;

    if (next && typeof next.tag === "function") {
        next = next.tag({ ...next.props, children: next.children });
    }

    if (!(next instanceof VDom)) {
        next = new VDom("", {}, next);
    }

    if (prev.tag !== next.tag) {
        base = create(next.tag, isSvg);
        if (node) {
            if (next.tag !== "") {
                let length = next.children.length;
                while (node.firstChild) {
                    if (!length--) break;
                    append(base, node.firstChild);
                }
            }
            replace(parent, base, node);
        } else {
            append(parent, base);
        }
    }
    if (next.tag) {
        diffProps(
            base,
            prev.tag === next.tag ? prev.props : {},
            next.props,
            isSvg
        );
        if (next.tag === "slot") {
            let name = next.props.name;
        } else {
            let nextBase = deep ? base : base.shadowRoot || base,
                childNodes = nextBase.childNodes,
                children = next.children,
                move = 0,
                length = Math.max(children.length, childNodes.length);
            for (let i = 0; i < length; i++) {
                let childI = i - move;
                if (i in children) {
                    diff(
                        root,
                        nextBase,
                        childNodes[childI],
                        children[i],
                        isSvg,
                        deep + 1
                    );
                } else {
                    remove(nextBase, childNodes[childI]);
                    move++;
                }
            }
        }
    } else {
        if (prev.children !== next.children) {
            base.textContent = next.children;
        }
    }
    base[PREVIOUS] = next;
    return base;
}

/**
 * compares the attributes associated with the 2 render states
 * @param {HTMLELement} node
 * @param {Object} prev - properties that the node already has
 * @param {Object} next - object with the new properties to define the node
 * @param {Boolean} [svg] - define if the html element is a svg
 * @param {Object} [collect] -It allows to recover properties, avoiding in turn the analysis
 *                            of these on the node, these are returned in an object in association
 *                            with the key of the loop
 * @param {Boolean} [nextMerge] - it allows not to eliminate the properties of the previous state and add them to the next state
 * @return {Object} Collected properties
 */
function diffProps(node, prev, next, isSvg) {
    let prevKeys = Object.keys(prev),
        nextKeys = Object.keys(next),
        keys = prevKeys.concat(nextKeys),
        define = {};

    for (let i = 0; i < keys.length; i++) {
        let prop = keys[i];

        if (define[prop] || prev[prop] === next[prop]) continue;

        define[prop] = true;

        let isFnPrev = typeof prev[prop] === "function",
            isFnNext = typeof next[prop] === "function";

        if (isFnPrev || isFnNext) {
            if (!isFnNext && isFnPrev) {
                node.removeEventListener(prop, node[LISTENERS][prop][0]);
            }
            if (isFnNext) {
                if (!isFnPrev) {
                    node[LISTENERS] = node[LISTENERS] || {};
                    if (!node[LISTENERS][prop]) {
                        node[LISTENERS][prop] = [
                            event => {
                                node[LISTENERS][prop][1](event);
                            }
                        ];
                    }
                    node.addEventListener(prop, node[LISTENERS][prop][0]);
                }
                node[LISTENERS][prop][1] = next[prop];
            }
        } else if (prop in next) {
            if ((prop in node && !isSvg) || (isSvg && prop === "style")) {
                if (prop === "style") {
                    if (typeof next[prop] === "object") {
                        let prevStyle = prev[prop] || {},
                            nextStyle = next[prop];
                        for (let prop in nextStyle) {
                            if (prevStyle[prop] !== nextStyle[prop]) {
                                if (prop[0] === "-") {
                                    node.style.setProperty(
                                        prop,
                                        nextStyle[prop]
                                    );
                                } else {
                                    node.style[prop] = nextStyle[prop];
                                }
                            }
                        }
                    } else {
                        node.style.cssText = next[prop];
                    }
                } else {
                    node[prop] = next[prop];
                }
            } else {
                isSvg
                    ? node.setAttributeNS(null, prop, next[prop])
                    : node.setAttribute(prop, next[prop]);
            }
        } else {
            node.removeAttribute(prop);
        }
    }
}
