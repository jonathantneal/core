import { assign, defer } from "./utils";
import {
	COMPONENT_CREATE,
	COMPONENT_UPDATE,
	COMPONENT_CREATED,
	COMPONENT_UPDATED,
	COMPONENT_REMOVE,
	COMPONENT_CLEAR
} from "./constants";

import { diff } from "./diff";
import { toVnode } from "./vnode";

/**
 * @typedef {(HTMLElement|SVGElement|Text)} Element
 *
 * @typedef {import("./vnode").Vnode} Vnode
 *
 * @typedef {Object<string,any>} Context
 *
 * @typedef {Function[]} Hooks
 *
 * @typedef {{prevent:boolean,context:Context,hooks:Hooks,next:Function,type:Function,props:import("./vnode").VnodeProps}} ComponentSnap
 *
 * @typedef {{type:string}} Action
 *
 */

/**
 * @type {ComponentSnap}
 */
let CURRENT_COMPONENT;
/**
 * @type {number}
 */
let CURRENT_COMPONENT_KEY_HOOK;
/**
 * Returns the concurrent component running
 * @returns {ComponentSnap}
 */
export function getCurrentComponent() {
	if (!CURRENT_COMPONENT) {
		throw new Error(
			"the hooks can only be called from an existing functional component in the diff queue"
		);
	}
	return CURRENT_COMPONENT;
}
/**
 * Create or recover, the current state according to the global index
 * associated with the component
 * @param {(Function|null)} reducer
 * @param {*} state
 * @return {[*,(state:any,action:{type:any}]};
 */
export function useHook(reducer, state) {
	let component = getCurrentComponent().component,
		index = CURRENT_COMPONENT_KEY_HOOK++,
		hook,
		isCreate;
	if (!component.hooks[index]) {
		isCreate = true;
		component.hooks[index] = { state };
	}
	hook = component.hooks[index];
	hook.reducer = reducer;
	if (isCreate) dispatchHook(hook, { type: COMPONENT_CREATE });
	return [hook.state, action => dispatchHook(hook, action)];
}
/**
 * dispatch the hook
 * @param {{reducer:(Function=),state}} hook
 * @param {Action} action
 */
export function dispatchHook(hook, action) {
	if (hook.reducer) {
		hook.state = hook.reducer(hook.state, action);
	}
}
/**
 * dispatches the state of the components to the hooks subscribed to the component
 * @param {ComponentSnap[]} components
 * @param {Action} action
 */
export function dispatchComponents(components, action) {
	let length = components.length;
	for (let i = 0; i < length; i++) {
		let component = components[i],
			hooks = component.hooks,
			hooksLength = hooks.length;
		// Mark the component as deleted
		if (action.type === COMPONENT_REMOVE) {
			component.remove = true;
		}
		for (let i = 0; i < hooksLength; i++) {
			dispatchHook(hooks[i], action);
		}
	}
}
/**
 * this function allows creating a block that analyzes the tag
 * defined as a function, in turn creates a global update scope for hook management.
 * @param {string} ID - name of space to store the components
 * @param {boolean} isSvg - inherit svg behavior
 */
export function createComponent(ID, isSvg) {
	/**@type {ComponentSnap[]} */
	let components = [];
	/**@type {Element} */
	let host;
	/**
	 * This function allows reducing the functional components based on
	 * their return, in turn creates a unique state for each component
	 * according to a depth index
	 * @param {Vnode} vnode
	 * @param {Context} context
	 * @param {number} deep - incremental index that defines the position of the component in the store
	 */
	function nextComponent(vnode, context, deep) {
		// if host does not exist as a node, the vnode is not reduced
		if (!host) return;
		vnode = toVnode(vnode);
		// if it is different from a functional node, it is sent to diff again
		if (typeof vnode.type != "function") {
			dispatchComponents(components.splice(deep), {
				type: COMPONENT_REMOVE
			});
			host = diff(ID, host, vnode, context, isSvg, updateComponent);
			// if the components no longer has a length, it is assumed that the updateComponent is no longer necessary
			if (components.length) host[ID].updateComponent = updateComponent;

			return;
		}
		/**@type {ComponentSnap} */
		let component = components[deep] || {};
		/**
		 * @type {boolean} define whether the component is created or updated
		 */
		let isCreate;
		/**
		 * @type {boolean} Define whether the component should continue with the update
		 */
		let withNext;

		if (component.type != vnode.type) {
			// the elimination is sent to the successors of the previous component
			dispatchComponents(components.splice(deep), {
				type: COMPONENT_REMOVE
			});
			// stores the state of the component
			components[deep] = assign({ hooks: [], context: {} }, vnode);
			isCreate = true;
			withNext = true;
		}

		component = components[deep];
		/**@type {Vnode} */
		let nextProps = vnode.props;
		/**@type {Vnode} */
		let prevProps = component.props;

		// Compare previous props with current ones
		if (!withNext) {
			let length = Object.keys(prevProps).length,
				nextLength = 0;
			// compare the lake of properties
			for (let key in nextProps) {
				nextLength++;
				if (nextProps[key] != prevProps[key]) {
					withNext = true;
					break;
				}
			}
			withNext = withNext || length != nextLength;
		}

		withNext = component.context != context || withNext;

		component.props = nextProps;

		// the current context is componentsd in the cache
		component.context = context;

		/**
		 * Create a snapshot of the current component
		 */
		function next() {
			if (component.remove) return host;

			CURRENT_COMPONENT = {
				component,
				/**
				 * updates the status of the component, forcing the update of this
				 */
				next() {
					if (!component.prevent) {
						component.prevent = true;
						defer(() => {
							component.prevent = false;
							next();
						});
					}
				}
			};

			CURRENT_COMPONENT_KEY_HOOK = 0;

			dispatchComponents([component], { type: COMPONENT_UPDATE });

			let vnextnode = component.type(component.props);
			// clean state constants
			CURRENT_COMPONENT = false;
			CURRENT_COMPONENT_KEY_HOOK = 0;

			nextComponent(vnextnode, component.context, deep + 1);

			dispatchComponents([component], {
				type: isCreate ? COMPONENT_CREATED : COMPONENT_UPDATED
			});

			isCreate = false;
		}
		if (withNext && !component.prevent) next();
	}
	/**
	 * allows to control HoCs and optimizes the executions
	 * of the components with the memo pattern
	 * @param {string} type - action to execute
	 * @param {Element} nextHost
	 * @param {Vnode} vnode
	 * @param {Context} context
	 * @returns {Element}
	 */
	function updateComponent(type, nextHost, vnode, context) {
		switch (type) {
			case COMPONENT_UPDATE:
				host = nextHost;
				nextComponent(vnode, context, 0);
				return host;
			case COMPONENT_CLEAR:
				dispatchComponents([].concat(components).reverse(), { type });
				break;
			case COMPONENT_REMOVE:
				host = false;
				dispatchComponents(components.reverse(), { type });
				components = [];
				break;
		}
	}

	return updateComponent;
}
