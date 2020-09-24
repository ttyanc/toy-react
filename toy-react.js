const RENDER_TO_DOM = Symbol('render to dom')

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
    
    get vdom () {
       return this.render().vdom;
    }

    // get vchildren(){
    //     return this.children.map(child => child.vdom);
    // }

    [RENDER_TO_DOM](range){
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range)
    }

    update(){
        let isSameNode = (oldNode,newNode)=>{
            //节点类型不同
            if (oldNode.type !== newNode.type){
                return false;
            }
            //属性不同
            for(let name in newNode.props){
                if(newNode.props[name] !== oldNode.props[name]){
                    return false;
                }
            }
            //属性个数不等
            if(Object.keys(oldNode.props).length > Object.keys(newNode.props).length){
                return false;
            }
            //文本节点，比对内容
            if(newNode.type == '#text'){
                if(newNode.content !== oldNode.content){
                    return false;
                }
            }

        }
        let update = (oldNode,newNode) =>{
            //type,props,children
            //#text content
            if(!isSameNode(oldNode,newNode)){
                newNode[RENDER_TO_DOM](oldNode._range);
                return;
            }
            newNode._range = oldNode._range;

            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            for(let i=0;i<newChildren.length;i++){
                let newChild = newChildren[i];   
                let oldChild = oldChildren[i];
                if(i<oldChildren.length){
                    update(oldChild,newChild);
                }   
            }
        }
        let vdom = this.vdom;
        update(this._vdom,vdom)
        this._vdom = vdom;
    }
    /*rerender(){
        //保存旧的range
        let oldRange = this._range

        //创建新的range,将新range放到旧range前
        let range = document.createRange();
        range.setStart(oldRange.startContainer,oldRange.startOffset);
        range.setEnd(oldRange.startContainer,oldRange.startOffset);
        this[RENDER_TO_DOM](range)

        //旧的range放到新range后面
        oldRange.setStart(range.endContainer,range.endOffset)
        oldRange.deleteContents();
        
    }*/

    
    setState(newState){
        if(this.state === null || typeof this.state !== 'object'){
            this.state = newState;
            this.rerender();
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
        this.update();
    }
}

class ElementWrapper extends Component{
    constructor(type){
        super(type);
        this.type = type;
    }
    /*setAttribute(name,val){
        if(name.match(/^on([\s\S]+)$/)){
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()),val);
        } else {
            if(name === 'className'){
                this.root.setAttribute('class',val)
            }else{
                this.root.setAttribute(name,val)
            }
        }
    }
    
    appendChild(component){
        let range = document.createRange();
        range.setStart(this.root,this.root.childNodes.length);
        range.setEnd(this.root,this.root.childNodes.length);
        range.deleteContents();
        component[RENDER_TO_DOM](range);
    }*/
    get vdom () {
        this.vchildren = this.children.map(child => child.vdom);
         return this;
        //  {
        //     type:this.type,
        //     props:this.props,
        //     children:this.children.map(child => child.vdom)
        // }
    }

    
    [RENDER_TO_DOM](range){
        this._range = range;

        let root =document.createElement(this.type);

        for(let name in this.props){
            let val = this.props[name]
            if(name.match(/^on([\s\S]+)$/)){
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLowerCase()),val);
            } else {
                if(name === 'className'){
                    root.setAttribute('class',val)
                }else{
                    root.setAttribute(name,val)
                }
            }
        }
        if(!this.vchildren)
            this.vchildren = this.children.map(child => child.vdom)
        for (let child of this.vchildren){
            let childRange = document.createRange();
            childRange.setStart(root,root.childNodes.length);
            childRange.setEnd(root,root.childNodes.length);
            childRange.deleteContents();
            child[RENDER_TO_DOM](childRange);
        }

        replaceContent (range,root);
    }
}
class TextWrapper extends Component{
    constructor(content){
        super(content);
        this.type ="#text";
        this.content = content;
       
    }
    get vdom () {
         return this;
        // {
        //     type:'#text',
        //     content:this.content
        // }
    }

    [RENDER_TO_DOM](range){
        this._range = range;
        let root = document.createTextNode(this.content)
        replaceContent (range,root);

    }
}

function replaceContent (range,node){
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();
    range.setStartBefore(node);
    range.setEndAfter(node);
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
            if(child === null){
                continue;
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