import React from 'react'
import ReactDOM from 'react-dom'


let comp = null
const crElement = React.createElement

class Wrapper  extends React.Component {
  constructor (props) {
    super(props)
    this.render = this.render.bind(this)
    this.values = []
    this.index = 0
    this.useState = initialValue => {
      const hookIndex = this.index++
      let value =
        hookIndex in this.values ? this.values[hookIndex] : initialValue

      return [
        value,
        value => {
          this.values[hookIndex] = value
          this.forceUpdate()
        }
      ]
    }
  }
  render () {
    this.index = 0
    comp = this
    const Component = this.props.component
    // console.log(Component, 'sdf')
    const props = this.props.props
    const children = this.props.children
    const component = crElement(Component, props, children)
    return component
  }
}
React.createElement = (Component, props, ...children) => {
  if (Component === React.Fragment || typeof Component === 'string') {
    return crElement(Component, props, children)
  }
  if (Component && (Component.prototype instanceof React.Component || Component.prototype instanceof React.PureComponent)) {
    return crElement(Component, props, children)
  }
  return crElement(Wrapper, {component: Component, props: props, children})
} 

const useSt = function (initialValue) {
  return comp.useState(initialValue)
}
const rootElement = document.getElementById('root')
const Y = function () {
  const [x, setX] = useSt(1)
  const [y, setY] = useSt(2)
  return <div onClick={() => {setX(x + 1);setY(y + 2)}}>y -- {x}-{y} -- y</div>
}
const Z = () => {
  
  const [x, setX] = useSt(0)
  return <><div onClick={() => {setX(x + 1)}}>--z-{x}--</div><Y /></>
}

const M = () => {
  const [x, setX] = useSt(0)
  return <div onClick={() => setX(x + 1)}>{x}</div>
}
const X = () => {
  const [x, setX] = useSt(0)
  const m = <M />
  const [y, setY] = useSt(true)
  return <>{m}<div onClick={() => {setX(x + 1);setY(!y)}}>--x-{x}-{y ? 'a' : 'b'}--</div><Y /><Z /></>
}
ReactDOM.render(<X />, rootElement)

