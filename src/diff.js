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
 * @param {Boolean} [nextMerge] - it allows not to eliminate the properties of the previous state and add them to the next state
 * @return {Object} Collected properties
 */
export function diffProps(node, prev, next, svg, collect, nextMerge) {
    // generates a list of the existing attributes in both versions
    let keys = Object.keys(prev).concat(Object.keys(next)),
        length = keys.length,
        props = {};

    for (let i = 0; i < length; i++) {
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
                            let prevStyle = prev[prop] || {},
                                nextStyle = next[prop];
                            for (let index in nextStyle) {
                                if (prevStyle[index] !== nextStyle[index]) {
                                    node.style[index] = nextStyle[index];
                                }
                            }
                            next[prop] = { ...prevStyle, ...nextStyle };
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
                if (nextMerge) {
                    next[prop] = prev[prop];
                } else {
                    node.removeAttribute(prop);
                }
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
        nextMaster = next;
    if (next) {
        next = slot(next, slots);
        prev = slot(prev, slots);
        svg = svg || next.tag === "svg";

        if (parent) {
            if (prev.tag !== next.tag) {
                nextNode = isDom(next.tag)
                    ? next.tag
                    : next.tag
                        ? svg
                            ? document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  next.tag
                              )
                            : document.createElement(next.tag)
                        : document.createTextNode("");
                if (prevNode) {
                    replace(parent, nextNode, prevNode);
                    while (!nextNode[ELEMENT] && prevNode.firstChild) {
                        append(nextNode, prevNode.firstChild);
                    }
                } else {
                    append(parent, nextNode);
                }
            }
        }
        if (nextNode.nodeType === 3) {
            if (prev.children[0] !== next.children[0])
                nextNode.textContent = next.children[0];
        } else {
            let collect = parent && nextNode[ELEMENT] && nextNode._props.keys,
                props = diffProps(
                    nextNode,
                    prev.props,
                    next.props,
                    svg,
                    /**
                     * It allows to obtain properties of the iteration of diff by properties
                     */
                    collect,
                    /**
                     * This allows not to delete the previous state and keep it in the next state
                     */
                    collect
                );
            if (nextNode[ELEMENT] && parent) {
                props.children = next.children.map(
                    vdom => (vdom.tag ? vdom : vdom.children)
                );
                nextNode.setProperties(props);
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
    } else {
        if (parent && prevNode) remove(parent, prevNode);
    }
    nextNode[MASTER] = nextMaster;
    return parent;
}
