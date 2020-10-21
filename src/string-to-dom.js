const string = `
    <html>
        <head>
        <style>
  @font-face {
    font-family: 'sdfsdf';
    font-display: swap;
    src: local('sdfsd'), url('//c.sdfsd.com/s/assets/style.2f0c4244.woff2') format('woff2'), url('//c.sdfsdfs.com/s/assets/style.6ed9d4a3.woff') format('woff'), url('//c.dsfsdf.com/s/assets/style.3339bd53.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
    </style><style data-emotion-css="hrtbqq">*,::before,::after{box-sizing:border-box;margin:0;padding:0;font:inherit;-webkit-tap-highlight-color:transparent;-webkit-overflow-scrolling:touch;}@media (min-width:1100px){*,::before,::after{-webkit-font-smoothing:antialiased;}}::before,::after{-webkit-font-smoothing:antialiased;}html,body{height:100%;}.pixel{display:none;}html{font-size:14px;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}body{position:relative;font-family:Rubik,Helvetica,sans-serif;font-style:normal;-webkit-tap-highlight-color:transparent;}body.fixed{overflow:hidden;}@media (min-width:1100px){body{font-weight:300;}}a{background-color:transparent;color:inherit;-webkit-text-decoration:none;text-decoration:none;}b,strong{font-weight:500;}button,input,select{border:none;border-radius:0;outline:none;}input[type='number'],input[type='number']::-webkit-inner-spin-button,input[type='number']::-webkit-outer-spin-button{-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield;}h2{font-weight:inherit;}img,a{border:none;outline:none;}select{background:transparent;-webkit-appearance:none;-moz-appearance:none;appearance:none;}ul{list-style:none;}.app{min-height:100%;}</style>
    <style>
  @font-face {
    font-family: 'Rubik';
    font-display: swap;
    font-weight: 400;
    font-style: normal;
    src: url('//c.housingcdn.com/s/assets/regular.6b0b2176.woff2');
  }
  @font-face {
    font-family: 'Rubik';
    font-display: swap;
    font-weight: 500;
    font-style: normal;
    src: url('//c.housingcdn.com/s/assets/medium.aea082bc.woff2');
  }
</style>
</head>
        <body>
            <div>
                <img  data:x="=test a'b'c <sachin>" alt='an"df' alt src="/def/abc.png?abc" abc="def" disabled >
                <br>
                <b>
                    hello 'mr' "sachin". a = b \\ / > ax &amp; &lt; <a href="abc.js?abc=def">he</a>
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
  setAttribute (name, value) {
    this.attrs.push({ name, value })
  }
  setAttributeVal (val) {
    const lastAttr = this.attrs[this.attrs.length - 1]
    if (lastAttr) {
      lastAttr.value = val
    }
  }
  popChild () {
    return this.children.pop()
  }
  appendChild (child) {
    this.children.push(child)
  }
}

const specialCharMap = {
  amp: '&',
  gt: '>',
  lt: '<',
  quot: '"',
  apos: "'"
}

const tokenTypeMap = {
  ' ': () => 'attrName',
  '<': () => 'node',
  '/': () => 'endNode',
  '>': () => 'text',
  ';': () => 'text',
  '&': () => 'specialChar',
  "'": current => current !== 'attrVal1' ? 'attrVal1' : 'node',
  '"': (current) => current !== 'attrVal' ? 'attrVal' : 'node'
}

const whiteListedChars = {
  text: [' ', '>', '/', '"', '=', "'", ';'],
  attrVal: [' ', '>', '/', '<', '=', "'"],
  attrVal1: [' ', '>', '/', '<', '=', '"'],
  node: [],
  endNode: [],
  attrName: [],
  specialChar: []
}

const ignoreChars = {
  attrVal: [';', '&'],
  attrVal1: [';', '&'],
  attrName: ['='],
  node: ['='],
  endNode: ['='],
  text: ['\n', '\t'],
  specialChar: []
}
const spaceCharacters = [' ', '\n', '\t']
const parser = str => {
  let stack = []
  let token = ''
  let tokenType = 'text'
  let length = str.length
  let isEmpty = true
  for (let i = 0; i < length; i++) {
    const char = str[i]
    const isSpaceChar = spaceCharacters.indexOf(char) >= 0
    if (ignoreChars[tokenType].indexOf(char) >= 0 || (isSpaceChar && char === token[token.length - 1])) {
      continue
    }
    // 2 characters are still a problem for script tags: & <
    if (['<', '>', ' ', '/', '"', "'", '&', ';'].indexOf(char) >= 0 && whiteListedChars[tokenType].indexOf(char) < 0) {
      processToken(char)
      resetToken()
      changeTokenType(char)
      continue
    }
    if (!isSpaceChar) {
      isEmpty = false
    }
    token += char
  }

  function processToken (char) {
    if (!isEmpty) {
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
        case 'specialChar':
          const newChar = specialCharMap[token]
          const oldTextNode = item.popChild()
          token = oldTextNode.name + newChar
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

  function changeTokenType (char) {
    tokenType = tokenTypeMap[char](tokenType)
  }

  function resetToken () {
    if (tokenType !== 'specialChar') {
      isEmpty = true
      token = ''
    }
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
