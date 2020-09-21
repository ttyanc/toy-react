import {createElement,Component,render} from './toy-react.js'

class MyComponent extends Component {
    render(){
        return <div>
            <h1>my component</h1>
            {this.children}
        </div>
    }
}
    
render(<MyComponent id="box" class="box">
<div>innder</div>
<div></div>
<div></div>
</MyComponent>,document.body)