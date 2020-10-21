const string = `
    <html>
        <body>
            <div>
                <img  data:x="=test a'b'c <sachin>" alt='an"df' alt src="/def/abc.png?abc" abc="def" disabled >
                <br>
                <b>
                    hello 'mr' "sachin". a = b \\ / > ax <a href="abc.js?abc=def">he</a>
                </b>
            </div>
        </body>
        <x>sdfsdfsd<br><br></x>
    </html>
`

const openTags = ['br', 'img']
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

const tokenTypeMap = {
  ' ': () => 'attrName',
  '<': () => 'node',
  '/': () => 'endNode',
  '>': () => 'text',
  "'": current => current !== 'attrVal1' ? 'attrVal1' : 'node',
  '"': (current) => current !== 'attrVal' ? 'attrVal' : 'node'
}

const whiteListedChars = {
  text: [' ', '>', '/', '"', '=', "'"],
  attrVal: [' ', '>', '/', '<', '=', "'"],
  attrVal1: [' ', '>', '/', '<', '=', '"'],
  node: [],
  endNode: [],
  attrName: []
}

const ignoreChars = {
  attrVal: [],
  attrVal1: [],
  attrName: ['='],
  node: ['='],
  endNode: ['='],
  text: []
}

const parser = str => {
  let stack = []
  let token = ''
  let tokenType = 'text'
  let length = str.length
  for (let i = 0; i < length; i++) {
    const char = str[i]
    if (ignoreChars[tokenType].indexOf(char) >= 0) {
      continue
    }
    if (['<', '>', ' ', '/', '"', "'"].indexOf(char) >= 0 && whiteListedChars[tokenType].indexOf(char) < 0) {
      processToken(char)
      resetToken(char)
      continue
    }
    token += char
  }

  function processToken(char) {
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
        case 'attrVal1':
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
  }

  function resetToken (char) {
    const nextTokenType = tokenTypeMap[char](tokenType)
    tokenType = nextTokenType
    token = ''
  }

  function handleEndNodes () {
    if (stack.length >= 2) {
      let openNode = stack.pop()
      const lastNode = stack[stack.length - 1]
      lastNode.appendChild(openNode)
    }
  }

  return stack
}
parser(string)
