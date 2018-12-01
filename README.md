<img src="brand/logo.png" width="280px"/>

A small library of **1.7kB** to create web-components based on **VIRTUAL-DOM**, **JSX** and **WEB-COMPONENTS**, with a minimum size.

```js
import { h, Element } from "atomico";

customElements.define(
    "my-button",
    class Tag extends Element {
        render() {
            return <button>my-button</button>;
        }
    }
);
```



### Índice

- [Reactive properties](#Reactive properties)
- [Properties as an event](#Properties as an event)
- [Lifecycle](#Lifecycle)
- [Shado dom](#Shado dom)
- [Tag `<host/>`](#Tag `<host/>`)
- [Installation](#Installation)

## Reactive properties

The reactivity in Atomico, depends on the method `static get props`, it must return an array or an object of reactive properties, these will be defined as properties of the component.

#### Example array

The array allows you to observe but not manipulate these properties.

```js
static get props(){
    return ["my-property"]
}
```

#### Example object	

By using the object you can manipulate the definition of properties.

```js
static get properties(){
    return {
        myProperty(next,prev){
            return next;
        }
    }
}
```

These properties are associated with the element, so you can manipulate the element externally, as taught in the following example:

```js
// example 1
document.querySelector("my-tag").myProperty = true;
// example 2
document.querySelector("my-tag").setProperty("my-property",true);
```

>  The new status of the property must be different from the previous one, to dispatch the update.

## Properties as an event

The definition of the event does not depend on a prefix, but rather on the type, you can define a property of the tag as an event by defining it as a function.

```js
<button
    click={() => {
        this.myProperty = true;
    }}
>
    ...
</button>;
```


## Lifecycle

| Method | Execution | Observation |
|:-------|:----------|:----|
| `constructor` | -- | Useful for defining an initial state |
| `onMounted` | after the first render | Useful for the realization of asynchronous calls or subscription of events |
| `onUpdated` | After the render execution | It is recommended to analyze the state of the dom, after each update |
| `onUnmounted` | After the component has been removed from the document | Useful for the elimination of global events |


## Shado dom


The use of shadow dom, allows the use of `<slot>` to enable shadow DOM, just enable it in the constructor, as the following example shows.

```js
constructor(){
    this.attachShadow({mode:"open"});
}
```

Another benefit of shadow-dom is the independence of style, you can use this benefit as the following example shows:

```js
render(){
	return <host>
        <style>{style}</style>	
    	<slot/>
    </host>
}	
```

> Note the use of `<host />`, this is a virtual tag that points directly to the web-component as a tag.

## Tag `<host/>`

This tag allows you to manipulate the state of the component, whether to add events, modify properties or others.

```js
render() {
    return (
        <host
        	style={{ color: this.color }}
    		click={() => this.color = "orange"}>
            	<slot />
		</host>
	);
}
```

## Installation

### Instalacion de bone-cli
Initialize a structure to start with Atomic
```js
npm install -g cli-bone
```
### Create component
Download from github, the skeleton to start with Atomico

```js
bone uppercod/Atomico.template
```
### yarn or npm install
The previous command will generate a folder, enter it and install the dependencies.

### script

It allows the generation of the bundle that groups the component, to visualize the component just open `ìndex.html` in the component directory.

```sh
# watch
npm run watch
# build
npm run build
# publish
npm publish
```

The component generated with `uppercod/atomico.template`, has the configuration to be shared in **npm** or **github**, remember to review `package.json` before publishing.