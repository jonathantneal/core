import { ELEMENT, MASTER } from "./constants";

import { remove, append, replace, root } from "./utils";
import { VDom, h, isDom } from "./vdom";
/**
 * compares the attributes associated with the 2 render states
 * @param {HTMLELement} node
 * @param {Object} prev - properties that the node already has
 * @param {Object} next - object with the new properties to define the node
 * @param {Boolean} [svg] - define if the html element is a svg
 * @param {Object} [collect] -It allows to recover properties, avoiding in turn the analysis
 *                            of these on the node, these are returned in an object in association
 *                            with the key of the loop
 * @return {Object} Collected properties
 */
export function diffProps(node, prev, next, svg, collect) {
    // generates a list of the existing attributes in both versions
    let keys = Object.keys(prev).concat(Object.keys(next)),
        props = {};

    for (let i = 0; i < keys.length; i++) {
        let prop = keys[i];
        if (prev[prop] !== next[prop]) {
            /**
             * Since prop is defined, Atomico will proceed only to take the attributes
             * defined for the component, the undefined ones continue the normal process
             */
            if (collect && collect.indexOf(prop) > -1) {
                props[prop] = next[prop];
                continue;
            }
            if (
                typeof next[prop] === "function" ||
                typeof prev[prop] === "function"
            ) {
                if (prev[prop]) node.removeEventListener(prop, prev[prop]);
                node.addEventListener(prop, next[prop]);
            } else if (prop in next) {
                if ((prop in node && !svg) || (svg && prop === "style")) {
                    if (prop === "style") {
                        if (typeof next[prop] === "object") {
                            for (let index in next[prop]) {
                                node.style[index] = next[prop][index];
                            }
                        } else {
                            node.style.cssText = next[prop];
                        }
                    } else {
                        node[prop] = next[prop];
                    }
                } else {
                    if (svg && prop === "xmlns") continue;
                    svg
                        ? node.setAttributeNS(null, prop, next[prop])
                        : node.setAttribute(prop, next[prop]);
                }
            } else {
                node.removeAttribute(prop);
            }
        }
    }
    return props;
}
/**
 *
 * @param {VDom} vdom - It allows to identify if this node requires the use of a slot
 * @param {Object} slots - Object that has living nodes associated by an index
 */
function slot(vdom, slots) {
    if (vdom.tag === "slot") {
        return new VDom(
            slots[vdom.props.name] || "",
            vdom.props,
            vdom.children
        );
    }
    return vdom;
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
 * @param {Boolean} svg - define if the html element is a svg
 * @return {HTMLELement} - returns the current node.
 */
export function diff(parent, prevNode, next, slots = {}, svg) {
    let prev = prevNode && prevNode[MASTER] ? prevNode[MASTER] : new VDom(),
        nextNode = prevNode,
        master = next,
        dom;
    if (next) {
        next = slot(next, slots);
        prev = slot(prev, slots);
        svg = svg || next.tag === "svg";
        dom = isDom(next.tag);
        if (parent) {
            if (prev.tag !== next.tag) {
                if (dom) {
                    nextNode = next.tag;
                    prevNode
                        ? replace(parent, nextNode, prevNode)
                        : append(parent, nextNode);
                } else if (next.tag) {
                    nextNode = svg
                        ? document.createElementNS(
                              "http://www.w3.org/2000/svg",
                              next.tag
                          )
                        : document.createElement(next.tag);
                    if (prevNode) {
                        replace(parent, nextNode, prevNode);
                        if (!nextNode[ELEMENT]) {
                            while (prevNode.firstChild) {
                                append(nextNode, prevNode.firstChild);
                            }
                        }
                    } else {
                        append(parent, nextNode);
                    }
                } else {
                    nextNode = document.createTextNode("");
                    if (prev.tag) {
                        replace(parent, nextNode, prevNode);
                    } else {
                        append(parent, nextNode);
                    }
                }
            }
        }
        if (nextNode.nodeType === 3) {
            if (prev.children !== next.children)
                nextNode.textContent = next.children;
        } else {
            let isElement = nextNode[Element],
                props = diffProps(
                    nextNode,
                    prev.props,
                    next.props,
                    svg,
                    isElement && nextNode._props.keys
                );
            if (isElement) {
                props.children = next.children.map(
                    vdom => (vdom.tag ? vdom : vdom.children)
                );
                this.setProperties(props);
            } else {
                if (nextNode) {
                    let children = Array.from(nextNode.childNodes),
                        length = Math.max(
                            children.length,
                            next.children.length
                        );
                    for (let i = 0; i < length; i++) {
                        diff(
                            nextNode,
                            children[i],
                            next.children[i],
                            slots,
                            svg
                        );
                    }
                }
            }
        }
        nextNode[MASTER] = master;
    } else {
        if (parent && prevNode) remove(parent, prevNode);
    }
    return parent;
}
