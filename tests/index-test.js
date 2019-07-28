import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import Markdown from 'src/'

describe('Markdown', () => {
	let node

	beforeEach(() => {
		node = document.createElement('div')
	})

	afterEach(() => {
		unmountComponentAtNode(node)
	})

	it('# h1', () => {
		render(<Markdown src='# h1'/>, node, () => {
			expect(node.innerHTML).toContain('<h1>h1</h1>')
		})
	})

	it('# h1 #', () => {
		render(<Markdown src='# h1 #'/>, node, () => {
			expect(node.innerHTML).toContain('<h1>h1</h1>')
		})
	})

	it('## h2', () => {
		render(<Markdown src='## h2'/>, node, () => {
			expect(node.innerHTML).toContain('<h2>h2</h2>')
		})
	})

	it('## h2 ##', () => {
		render(<Markdown src='## h2 ##'/>, node, () => {
			expect(node.innerHTML).toContain('<h2>h2</h2>')
		})
	})

	it('[text](link)', () => {
		render(<Markdown src='[text](link)'/>, node, () => {
			expect(node.innerHTML).toContain('<a href="link" title="">text</a>')
		})
	})
})
