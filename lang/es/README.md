<img src="../../brand/logo.png" width="280px"/>


Una pequeña librería de **1.7kB** para crear web-componentes a base de **VIRTUAL-DOM**, **JSX** y **WEB-COMPONENTS**.

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

- [Objetivo](#Objetivo)
- [Propiedades reactivas](#Propiedades reactivas)
- [Propiedades como evento](#Propiedades como evento)
- [Ciclo de vida](#Ciclo de vida)
- [Shado dom](#Shado dom)
- [Tag `<host/>`](#Tag `<host/>`)
- [Instalación](#Instalación)

### Objetivo

Aprovechar conceptos ya conocidos sea **VIRTUAL-DOM**, **JSX** y **WEB-COMPONENTS** para buscar simplificar la forma en la se crean, con una mínima carga de dependencia. 


## Propiedades reactivas

La reactividad en Atomico, depende del método  `static get props`, este debe retornar un arreglo o un objeto de propiedades reactivas, estas se definirán como propiedades del componente.

#### Ejemplo arreglo

El arreglo permite observar pero no manipular estas propiedades.

```js
static get props(){
    return ["my-property"]
}
```

#### Ejemplo objeto	

Mediante el uso del objeto ud podrá manipular la definición del propiedades. 

```js
static get properties(){
    return {
        myProperty(next,prev){
            return next;
        }
    }
}
```

Estas propiedades se asocian al elemento, por lo que ud podrá manipular el elemento de forma externa, como se enseña en el siguiente ejemplo:

```js
// forma 1
document.querySelector("my-tag").myProperty = true;
// forma 2
document.querySelector("my-tag").setProperty("my-property",true);
```

>  El nuevo estado de la propiedad debe ser distinto al anterior, para despachar la actualización.

## Propiedades como evento

La definición del evento no depende de un prefijo, sino por la de tipo, ud podrá definir una propiedad del tag como evento definiéndola como función.

```js
<button
    click={() => {
        this.myProperty = true;
    }}
>
    ...
</button>;
```



## Ciclo de vida

| Metodo | Ejecución | Observación |
|:-------|:----------|:----|
| `constructor` | -- | Util para la definición de un estado inicial |
| `onMounted` | luego del primer render | Útil para la realizacion de llamadas asíncronas o suscribcion de eventos |
| `onUpdated` | Luego de la ejecución de render | Se recomienda para analizar el estado del dom, luego de cada actualización |
| `onUnmounted` | Luego de que el componente ha sido eliminado del documento | Util para la eliminación de eventos globales |



## Shado dom

El uso de shadow dom, permite el uso de `<slot>,` para habilitar el shadow dom solo habilítelo en el constructor, como enseña el siguiente ejemplo.

```js
constructor(){
    this.attachShadow({mode:"open"});
}
```

Otro beneficio del shadow-dom es la independencia del estilo, ud podrá usar este beneficio como enseña el siguiente ejemplo:

```js
render(){
	return <host>
        <style>{style}</style>	
    	<slot/>
    </host>
}	
```

> Note el uso del `<host/>`, este es un tag virtual que apunta directamente al web-component como etiqueta. 

## Tag `<host/>`

Este tag permite manipular el estado del componente, sea añadir eventos, modificar propiedades u otros.

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

## Instalación

### Instalacion de bone-cli
Inicializar una estructura para comenzar con Atomico
```js
npm install -g cli-bone
```
### Crear componente
Descarga desde github, el esqueleto para comenzar con Atomico
```js
bone uppercod/Atomico.template
```
### yarn o npm install
El comando anterior generará una carpeta, ingrese a ella e instale las dependencias.

### script

Permite la generación del bundle que agrupa el componente, para visualizar el componente solo abra `ìndex.html` en el directorio del componente.

```sh
# watch
npm run watch
# build
npm run build
# publish
npm publish
```

El componente generado con `uppercod/atomico.template`, posee la configuración para ser compartido en **npm** o **github**, recuerde revisar `package.json` antes de publicar.