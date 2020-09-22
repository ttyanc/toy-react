const RENDER_TO_DOM = Symbol('render to dom')
class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name,val){
        if(name.match(/^on([\s\S]+)$/)){
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()),val);
        } else {
            this.root.setAttribute(name,val)
        }
    }
    appendChild(component){
        let range = document.createRange();
        range.setStart(this.root,this.root.childNodes.length);
        range.setEnd(this.root,this.root.childNodes.length);
        range.deleteContents();
        component[RENDER_TO_DOM](range);
    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root)
    }
}
class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content)
    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root)
    }
}

export class Component{
    constructor(type){
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }
    setAttribute(name,val){
        this.props[name] = val;
    }
   
    appendChild(component){
        this.children.push(component)
    }
    [RENDER_TO_DOM](range){
        this._range = range;
        this.render()[RENDER_TO_DOM](range)
    }
    rerender(){
        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range)
    }
    setState(newState){
        if(this.state === null || typeof this.state !== 'object'){
            this.state = newState;
            this.rerender()
            return;
        }
        let merge = (oldState,newState) => {
            for(let p in newState){
                if(oldState[p] === null || typeof oldState[p] !== 'object'){
                    oldState[p] = newState[p];
                }else {
                    merge( oldState[p],newState[p])
                }
            }
        }
        merge(this.state,newState)
        this.rerender()
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
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}