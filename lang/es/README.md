<img src="brand/logo.png" width="280px"/>
<br/>

Una pequeña librería para crear web-components a base de JSX, [Ver Instalación](#Instalacion).

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
## Atomico ❤️ JSX

Si ud busca trabajar con Atomico le comentó con anterioridad elementos interesantes del virtual-dom de Atomico.

### Propiedad como eventos

Si una propiedad del tag sea ha definido como función, esta se registrará como un evento.

```js
render(){
  return <button click={this.handlerClick}>🤷</button>
}
```
> Esto es útil si ud busca trabajar con custom-events, ya que Atomico no muta en nombre del evento.

### Tag Slot

El tag `<slot name="any"/>`, le permite interactuar con nodos reales, por defecto Atomico obtiene los slot al momento de montar el componente.

```html
<my-tag>
    <img slot="image"/>
</my-tag>
```
Ud puede interactuar con estos slot por medio del virtual-dom
```js
render(){
  return <slot name="image" src="my-image.jpg" click={this.handlerClick}/>
}
```
>La interacción de Atomico solo se limita a la definición de propiedades.

### Tag host

El tag `<host/>` representa al mismo componente, esto es útil para manipular el estado de la etiqueta de raíz.

```js
render(){
  return <host style={{background:"black",color:"white",display:"block"}}>
      {this.is}
  </host>
}
```

### Observaciones adicionales

El Virtual-dom de Atomico no soporta:

1. **ref** : Ud puede usar `this.content.querySelector("selector")`, para lograr un efecto similar.
2. **key** : Aunque algunos consideran una buena práctica el uso de key en el manejo de listas, como autor de Atomico no las considero de uso frecuente como para brindarle soporte dentro de Atomico.
3. **fragmentos**:`</>` Ud no necesitara usar fragmentos ya que el web-componente es y sera siempre su raiz.

## Ciclo de vida


| Metodo | Ejecución | Observación |
|:-------|:----------|:----|
| constructor | -- | Util para la definición de un estado inicial |
| onMounted | luego del primer render | Útil para la realizacion de llamadas asíncronas o suscribcion de eventos |
| onUpdate(props:Object) | Cada vez que se modifica una propiedad asociada a `static get props` | Si este método retorna `false` previene la ejecución de render |
| onUpdated | Luego de la ejecución de render | Se recomienda para analizar el estado del dom, luego de cada actualización |
| onUnmounted | Luego de que el componente ha sido eliminado del documento | Util para la eliminación de eventos globales |

## Shadow dom

Por defecto Atomico trabajara sobre el shadow dom siempre que ud lo habilite.

```js
constructor(){
  this.attachShadow({mode:"open"});
}
```

## setAttribute

Atomico capta el uso de setAttribute, asociado al componente, para así enviar a `setProperties`, el objeto de actualización, sólo si el índice coincide con una propiedad de `static get props`

```js
document.querySelector("my-tag").setAttribute("my-prop",{});
```
La mayor ventaja del uso de `setAttribute` es el traspaso en **raw** del valor asociado la propiedad.

## Instalacion

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