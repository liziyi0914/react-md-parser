import React, {Component} from 'react'
import {render} from 'react-dom'

import Markdown from '../../src'

var md = `
# React-MD-Parser

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

React-MD-Parser是\\*一个\\*基于React的Markdown解析库。

# 特性
- 可扩展语法
- 可自定义组件模板

[build-badge]: https://img.shields.io/travis/liziyi0914/react-md-parser/master.png?style=flat-square
[build]: https://travis-ci.org/liziyi0914/react-md-parser

[npm-badge]: https://img.shields.io/npm/v/react-md-parser.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-md-parser

[coveralls-badge]: https://img.shields.io/coveralls/liziyi0914/react-md-parser/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/liziyi0914/react-md-parser
`
class Demo extends Component {
	render() {
		return <div>
			<h1>React-MD-Parser Demo</h1>
			<Markdown src={md}/>
			</div>
	}
}

render(<Demo/>, document.querySelector('#demo'))
