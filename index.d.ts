interface Slots{
    [key:string] : HTMLElement | SVGAElement
}

interface PropsKeys{
    keys:String[],
    types:Object
}

interface Props{
    [key:string]:Function;
}

type Tag = String | HTMLElement | SVGAElement;

declare module "atomico"{
    export function h(tag:Tag,attrs:Object,...children:any):Object
    export class Component extends HTMLElement{
        state:Object;
        props:Object;
        slots:Slots;
        preventRender:Boolean;
        is:String;
        _props:PropsKeys;
        get content():HTMLElement;
        static get props():String[]|Props;
        setAttribute(prop:String,value:Any);
        setProperties(props:Object);
        setState(state:Object);
        getContext(context:any):any;
        onMounted();
        onUpdate(props:Object):?Boolean;
        onUpdated();
        dispatch(type:string,detail:any);
        render();
    }
}