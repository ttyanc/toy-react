class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name,val){
        this.root.setAttribute(name,val)
    }
    appendChild(component){
        this.root.appendChild(component.root)
    }
}
class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content)
    }
}

export class Component{
    constructor(type){
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
    }
    setAttribute(name,val){
        this.props[name] = val;
    }
    appendChild(component){
        this.children.push(component)
    }
    get root(){
        if(!this._root){
            this._root = this.render().root;
        } 
        return this._root
    }
}

//在JSX语法中，使用的标签类型有两种：DOM类型的标签（div、span等)和React组件类型的标签（关注后面文章）。
//DOM类型的标签需要标签的首字母小写，
//React组件类型的标签需要首字母大写。
//React也是通过首字母的大小写来判断渲染的是哪种类型的标签。

//模拟jsx功能 DOM类型的标签
export function createElement (type, attrs, ...children){
    let e ;
    if(typeof type === 'string'){
        e = new ElementWrapper(type);
    }else{
        e = new type
    }
    for (let p in attrs){
        e.setAttribute(p,attrs[p])
    }
    let insertChild = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child)
            }
            if(typeof child === 'object' && child instanceof Array){
                insertChild(child)
            } else{
                e.appendChild(child)
            }
        }
    }
    insertChild(children)
    return e
}

export function render(component,parentElement){
    parentElement.appendChild(component.root)
}