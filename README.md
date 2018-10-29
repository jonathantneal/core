<img src="brand/logo.png" width="280px"/>
<br/>

A small library to create web-components based on JSX, [See Installation](#Installation).


```js
import { h, Element } from "atomico";

customElements.define(
    "my-tag",
    class extends Element {
        render() {
            return (
                <host
                    click={() => {
                        this.setState({
                            toggle: !this.state.toggle
                        });
                    }}
                >
                    {this.state.toggle ? "🚀" : "🔥"}
                </host>
            );
        }
    }
);
```

## Observe properties

You can listen to certain properties associated with your component, each time you update one of these properties the `onUpdate` method will be called.

You can use an array to define which properties you will observe.

```js
static get props(){
    return [
        "property-one", // this.props.propertyOne
        "property-two"  // this.props.propertyTwo
    ]
}
```

You can use an object to define which properties you will observe, each property will be associated with a function, this function will be executed when defining the property.

```js
static get props(){
    return {
        "property-one":Number, // this.props.propertyOne
        "property-two":String,  // this.props.propertyTwo
        "property-json":JSON.parse // this.props.propertyJson
    }
}
```

## Atomico ❤️ JSX

If you are looking to work with Atomico, you have previously commented on interesting elements of Atomico's virtual-dom.

### Property as events

If a property of the tag has been defined as a function, it will be registered as an event.

```js
render(){
  return <button click={this.handlerClick}>🤷</button>
}
```
> This is useful if you want to work with custom-events, since Atomico does not change in the name of the event.

### Tag Slot

The tag `<slot name ="any"/>`, allows you to interact with real nodes, by default Atomico obtains the slot when mount the component.

```html
<my-tag>
    <img slot="image"/>
</my-tag>
```
You can interact with these slot through virtual-dom
```js
render(){
  return <slot name="image" src="my-image.jpg" click={this.handlerClick}/>
}
```
>The interaction of Atomico is only limited to the definition of properties.

### Tag host

The `<host/>` tag represents the same component, this is useful for manipulating the state of the root label.

```js
render(){
  return <host style={{background:"black",color:"white",display:"block"}}>
      {this.is}
  </host>
}
```

### Additional remarks

The Virtual-dom of Atomico does not support:

1. **ref**: You can use `this.content.querySelector("selector")`, to achieve a similar effect.
2. **key**: Although some consider it a good practice to use key in list management, as the author of Atomico, I do not consider them to be of frequent use to provide support within Atomico.
3. **fragments**: `</>` You will not need to use fragments since the web-component is and will always be its root.

## Lifecycle


| Method | Execution | Observation |
|:-------|:----------|:----|
| constructor | -- | Useful for defining an initial state |
| onMounted | after the first render | Useful for the realization of asynchronous calls or subscription of events |
| onUpdate(props:Object) | Each time a property associated with `static get props` is modified | If this method returns `false` it prevents rendering |
| onUpdated | After the render execution | It is recommended to analyze the state of the dom, after each update |
| onUnmounted | After the component has been removed from the document | Useful for the elimination of global events |

## Element

### Shadow-dom

By default Atomico works on the shadow-dom whenever you enable it.

```js
constructor(){
  this.attachShadow({mode:"open"});
}
```


### preventRender

Atomico uses an asynchronous render, every time a render is executed it is defined as true `this.preventRender`, this prevents the render function from being used again. You can define it as true to avoid rendering the view again.

### content

By using `this.content`, you will get the node that encapsulates the content within the component.

### slots

The slots property, stores the nodes taken at the time of component mount you can create your own slot manually associating index to an HTMLELement.


### setAttribute

Atomico captures the use of setAttribute, associated with the component, to send the update object to `setProperties`, only if the index matches a property of` static get props`

```js
document.querySelector("my-tag").setAttribute("my-prop",{});
```
The biggest advantage of using `setAttribute` is the transfer in **raw** of the value associated with the property.

### setProperties(props:Object)

This method is executed by Atomico when mutating a property observed either by `setAttribute` or `attributeChangedCallback`

### setState(state:Object)

This method allows you to update the view based on a new state, this must always receive an object as the first parameter.

### is

It has the name of the tag

### props

It has the properties associated with the component

### Contextos

Using the `getContext` method, the diff process recovers the return to share a context between components.

```js
getContext(context = {}){
   return {...context,message:"context!"};
}
render(){
    return <h1>{this.context.message}</h1>
}
```

> The context can be any value that approves the following expression `getContext (context) || context`.

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