import { update } from "./update";
import { vnode } from "./vnode";
export { options } from "./options";

export { createContext } from "./createContext";

export { useHook, useState, useEffect, useContext } from "./component";

export { useRef, useMemo } from "./customHooks";

export function h(tag, props, ...children) {
    return vnode(tag, props, children);
}
/**
 * this function allows you to manipulate elements from inside or from the container,
 * to enable manipulation from the container you must define isHost as true.
 * @param {object} vnode
 * @param {HTMLElement|SVGElement} node
 * @param {boolean} [isHost]
 */
export function render(vnode, node, isHost) {
    update(
        node,
        isHost
            ? vnode
            : typeof vnode === "object" && vnode.tag === "host"
            ? vnode
            : h("host", {}, vnode)
    );
}
