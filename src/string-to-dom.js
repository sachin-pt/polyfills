var string = `
    <html>
        <body>
            <div>
                <img src="abc.png" abc="def" disabled>
                <br>
                <b>
                    hello world. a = b
                </b>
            </div>
        </body>
    </html>
`

var openTags = ['br', 'img']
class Node {
  constructor (name, type = 'node') {
    this.name = name
    this.type = type
    this.attrs = []
    this.children = []
  }
  setAttribute(name, value) {
    this.attrs.push({name, value})
  }
  setAttributeVal(val) {
    const lastAttr = this.attrs[this.attrs.length - 1]
    if (lastAttr) {
      lastAttr.value = val
    }
  }
  appendChild(child) {
    this.children.push(child)
  }
}

var tokenTypeMap = {
  " ": () => 'attrName',
  '<': () => 'node',
  "/": () => 'endNode',
  '>': () => 'text',
  "\"": (current) => current !== 'attrVal' ? 'attrVal' : 'node'
}

var parser = str => {
  let stack = []
  let token = ''
  let tokenType = 'text'
  let length = str.length
  function handleEndNodes () {
    if (stack.length >= 2) {
      let openNode = stack.pop()
      const lastNode = stack[stack.length - 1]
      lastNode.appendChild(openNode)
    }
  }
  function resetToken(char) {
    token = token.trim()
    if (token) {
      const item = stack[stack.length - 1] || new Node()
      switch (tokenType) {
        case 'node':
          const node = new Node(token)
          stack.push(node)
          break
        case 'attrName':
          item.setAttribute(token)
          break
        case 'attrVal':
          item.setAttributeVal(token)
          break
        case 'text':
          item.appendChild(new Node(token, 'text'))
          break
      }
    }
    const item = stack[stack.length - 1]
    if (char === '>' && item && (openTags.indexOf(item.name) >= 0 || tokenType === 'endNode')) {
      handleEndNodes()
    }
    const nextTokenType = tokenTypeMap[char](tokenType)
    tokenType = nextTokenType
    token = ''
  }
  for (let i = 0; i < length; i++) {
    const char = str[i]
    if (char === '=' && tokenType !== 'text') {
      continue
    }
    if (['<', '>'].indexOf(char) >= 0 || ([' ', '/', '"'].indexOf(char) >= 0 && tokenType !== 'text')) {
      resetToken(char)
      continue
    }
    token += char
  }
  return stack
}
parser(string)
// space -> attrName
// < -> node -> new node added
// > -> text -> find attrs end them, find current node end it
// " -> current !== 'val' ? 'val' : node
//
