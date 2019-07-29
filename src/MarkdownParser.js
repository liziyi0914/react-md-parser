import React, {Component} from 'react';
import {
	MarkdownRender,
	H,
	P,
	Br,
	OList,
	UList,
	Quote,
	Link,
	Image,
	Em,
	Strong,
	Code
} from './MarkdownRender';
import MarkdownConfig from './MarkdownConfig';

const _uuid = require('uuid/v4');

class Parser {

	name = 'Parser';

	toString() {
		return this.name;
	}

	constructor() {}
	render() {return null;}
}

class BlockParser extends Parser {

	inline_tree = [];
	comps = {};

	name = 'BlockParser';

	md = null;

	inlines = [
		CodeInline,
		ImageInline,
		LinkInline,
		StrongInline,
		EmInline
	];

	constructor() {
		super();
	}

	bindMarkdown(md) {
		this.md = md;
	}

	bindComp(uuid,inline) {
		this.comps[uuid] = inline;
	}

	add(inline) {
		this.inline_tree.push(this.parseInline(inline));
	}

	parseInline(line) {
		var ret = line;
		for(let inline of MarkdownConfig.InlineParsers) {
			if(inline.test(ret)) {
				ret = inline.parse(ret,this);
			}
		}
		return ret;
	}

	renderInline() {
		var result = [];
		for(let line of this.inline_tree) {
			result.push(InlineParser.renderChildren(line,this.md,this.comps));
		}
		return result;
	}

}

class InlineParser extends Parser {

	name = 'InlineParser';

	constructor() {
		super();
	}

	static getPattern() {
		return /@/;
	}

	static getUUID() {
		return '{$@'+_uuid().replace(/\-/g,'')+'}';
	}

	static parseOne(line,block) {
		return line;
	}

	static parse(line,block) {
		var tmp = line;
		var index = tmp.search(this.getPattern());
		while(index!=-1) {
			tmp = this.parseOne(tmp,block);
			index = tmp.search(this.getPattern());
		}
		return tmp;
	}

	static renderChildren(line,md,comps) {
		var result = [];
		var parts = line.split('{@SPLIT@}');
		for(let part of parts) {
			if(part.match(/^\{\$@.*\}$/)) {
				result.push(comps[part].render(md,comps));
			} else {
				result.push(part);
			}
		}
		return result;
	}

}

class HBlock extends BlockParser {

	level = 1;

	constructor() {
		super();
	}

	static test(line) {
		return /^#+ .+/.test(line);
	}

	static parse(line,lastBlock) {
		var block = new HBlock();
		block.level = line.match(/^#+/)[0].length;
		var l = line.replace(/^#+ /,'').replace(/\s*#*$/,'');
		block.add(l);
		return block;
	}

	render() {
		return <MarkdownConfig.Renders.h level={this.level}>{this.renderInline()}</MarkdownConfig.Renders.h>;
	}

}

class PBlock extends BlockParser {
	constructor() {
		super();
	}

	static test(line) {
		return true;
	}

	static parse(line,lastBlock) {
		if(lastBlock instanceof PBlock) {
			lastBlock.add(line);
			return null;
		}
		var block = new PBlock();
		block.add(line);
		return block;
	}

	render() {
		return <MarkdownConfig.Renders.p>{this.renderInline()}</MarkdownConfig.Renders.p>;
	}
}

class UListBlock extends BlockParser {
	constructor() {
		super();
	}

	static test(line) {
		return /^[\*\+\-] /.test(line);
	}

	static parse(line,lastBlock) {
		var l = line.replace(/^[\*\+\-] /,'');
		if(lastBlock instanceof UListBlock) {
			lastBlock.add(l);
			return null;
		}
		var block = new UListBlock();
		block.add(l);
		return block;
	}

	render() {
		return <MarkdownConfig.Renders.ul list={this.renderInline()}/>
	}
}

class OListBlock extends BlockParser {
	constructor() {
		super();
	}

	static test(line) {
		return /^\d+\. /.test(line);
	}

	static parse(line,lastBlock) {
		var l = line.replace(/^\d+\. /,'');
		if(lastBlock instanceof OListBlock) {
			lastBlock.add(l);
			return null;
		}
		var block = new OListBlock();
		block.add(l);
		return block;
	}

	render() {
		return <MarkdownConfig.Renders.ol list={this.renderInline()}/>
	}
}

class QuoteBlock extends BlockParser {
	constructor() {
		super();
	}

	static test(line) {
		return /^>/.test(line);
	}

	static parse(line,lastBlock) {
		var l = line.replace(/^>/,'');
		if(lastBlock instanceof QuoteBlock) {
			lastBlock.text += '\n'+l;
			return null;
		}
		var block = new QuoteBlock();
		block.text = l;
		return block;
	}

	render() {
		return <MarkdownConfig.Renders.quote>{new MarkdownParser().parse(this.text)}</MarkdownConfig.Renders.quote>
	}
}

class RefBlock extends BlockParser {
	constructor() {
		super();
	}

	static test(line) {
		return /^\[.*\]:\s+.*/.test(line);
	}

	static parse(line,lastBlock,parser) {
		var block = new RefBlock();
		block.id = line.match(/^\[.*\]/)[0].replace(/[\[\]]/g,'');
		if(/[\)\'\"]$/.test(line)) {
			block.title = line.match(/[\(\'\"].*[\)\'\"]$/)[0].replace(/[\(\)\'\"]/g,'');
			line = line.replace(/\s*[\(\'\"].*[\)\'\"]$/,'');
		} else {
			block.title = '';
		}
		block.link = line.match(/:\s+.*$/)[0].replace(/^:\s+/,'');
		parser.addRef(block);
		return null;
	}

	render() {
		return null;
	}
}

class LinkInline extends InlineParser {

	name = 'LinkInline';

	static test(line) {
		return /\[.*?\](\(.*?\)|\s?\[.*?\])/.test(line);
	}

	static getPattern() {
		return /\[.*?\](\(.*?\)|\s?\[.*?\])/;
	}

	static parseOne(line,block) {
		var tmp = line;
		var inline = new LinkInline();
		var match = tmp.match(this.getPattern())[0];
		inline.text = match.match(/\[.*?\]/)[0].replace(/[\[\]]/g,'');
		if(/\[.*?\]\s?\[.*?\]$/.test(match)) {
			inline.ref = match.substr(match.match(/\[.*?\]/)[0].length).match(/\[.*\]$/)[0].replace(/[\[\]]/g,'');
		} else {
			inline.link = match.match(/\(.*?\)/)[0].replace(/[\(\)]/g,'');
			if(/ [\'\"].*[\'\"]$/.test(inline.link)) {
				inline.title = inline.link.match(/ [\'\"].*[\'\"]$/)[0].replace(/[ \'\"]/,'');
				inline.link = inline.link.replace(/ [\'\"].*[\'\"]$/,'');
			} else {
				inline.title = '';
			}
		}
		var uuid = this.getUUID();
		block.bindComp(uuid,inline);
		return tmp.replace(this.getPattern(),'{@SPLIT@}'+uuid+'{@SPLIT@}');
	}

	render(md,comps) {
		if(this.ref!=undefined & md.refs[this.ref]!=undefined) {
			this.link = md.refs[this.ref].link;
			this.title = md.refs[this.ref].title;
		}
		return <MarkdownConfig.Renders.link to={this.link} title={this.title}>{InlineParser.renderChildren(this.text,md,comps)}</MarkdownConfig.Renders.link>;
	}

}

class ImageInline extends InlineParser {

	name = 'ImageInline';

	static test(line) {
		return /\!\[.*?\](\(.*?\)|\s?\[.*?\])/.test(line);
	}

	static getPattern() {
		return /\!\[.*?\](\(.*?\)|\s?\[.*?\])/;
	}

	static parseOne(line,block) {
		var tmp = line;
		var inline = new ImageInline();
		var match = tmp.match(this.getPattern())[0];
		inline.alt = match.match(/\!\[.*?\]/)[0].replace(/[\!\[\]]/g,'');
		if(/\!\[.*?\]\s?\[.*?\]/.test(match)) {
			inline.ref = match.substr(match.match(/\!\[.*?\]/)[0].length).match(/\[.*\]$/)[0].replace(/[\[\]]/g,'');
		} else {
			inline.src = match.match(/\(.*?\)/)[0].replace(/[\(\)]/g,'');
		}
		var uuid = this.getUUID();
		block.bindComp(uuid,inline);
		return tmp.replace(this.getPattern(),'{@SPLIT@}'+uuid+'{@SPLIT@}');
	}

	render(md,comps) {
		if(this.ref!=undefined) {
			this.src = md.refs[this.ref].link;
			this.alt = md.refs[this.ref].title;
		}
		return <MarkdownConfig.Renders.image src={this.src} alt={this.alt}/>;
	}

}

class EmInline extends InlineParser {

	static test(line) {
		return /(\*|\_)[^\*\_]*?(\*|\_)/.test(line);
	}

	static getPattern() {
		return /(\*|\_)[^\*\_]*?(\*|\_)/;
	}

	static parseOne(line,block) {
		var tmp = line;
		var inline = new EmInline();
		var match = tmp.match(this.getPattern())[0];
		inline.text = match.replace(/[\*\_]/g,'');
		var uuid = this.getUUID();
		block.bindComp(uuid,inline);
		return tmp.replace(this.getPattern(),'{@SPLIT@}'+uuid+'{@SPLIT@}');
	}

	render(md,comps) {
		return <MarkdownConfig.Renders.em>{InlineParser.renderChildren(this.text,md,comps)}</MarkdownConfig.Renders.em>;
	}

}

class StrongInline extends InlineParser {
	static test(line) {
		return /(\*\*|\_\_)[^\*\_]*?(\*\*|\_\_)/.test(line);
	}

	static getPattern() {
		return /(\*\*|\_\_)[^\*\_]*?(\*\*|\_\_)/;
	}
	static parseOne(line,block) {
		var tmp = line;
		var inline = new StrongInline();
		var match = tmp.match(this.getPattern())[0];
		inline.text = match.replace(/[\*\_]/g,'');
		var uuid = this.getUUID();
		block.bindComp(uuid,inline);
		return tmp.replace(this.getPattern(),'{@SPLIT@}'+uuid+'{@SPLIT@}');
	}

	render(md,comps) {
		return <MarkdownConfig.Renders.strong>{InlineParser.renderChildren(this.text,md,comps)}</MarkdownConfig.Renders.strong>;
	}

}

class CodeInline extends InlineParser {
	static test(line) {
		return /`.*?`/.test(line);
	}

	static getPattern() {
		return /`.*?`/;
	}
	static parseOne(line,block) {
		var tmp = line;
		var inline = new CodeInline();
		var match = tmp.match(this.getPattern())[0];
		inline.text = match.replace(/`/g,'');
		var uuid = this.getUUID();
		block.bindComp(uuid,inline);
		return tmp.replace(this.getPattern(),'{@SPLIT@}'+uuid+'{@SPLIT@}');
	}

	render(md,comps) {
		return <MarkdownConfig.Renders.code>{InlineParser.renderChildren(this.text,md,comps)}</MarkdownConfig.Renders.code>;
	}

}

class MarkdownParser {

	block_tree = [];

	refs = {};

	static blocks = [
		QuoteBlock,
		RefBlock,
		HBlock,
		UListBlock,
		OListBlock,
		PBlock
	];

	static init() {
		MarkdownConfig.BlockParsers = [
			QuoteBlock,
			RefBlock,
			HBlock,
			UListBlock,
			OListBlock,
			PBlock
		];
		MarkdownConfig.InlineParsers = [
			CodeInline,
			ImageInline,
			LinkInline,
			StrongInline,
			EmInline
		];
		MarkdownRender.init();
		MarkdownConfig.haveInited = true;
	}

	constructor() {}

	parse(source) {
		if(!MarkdownConfig.haveInited) {
			MarkdownParser.init();
		}
		var lines = source.split('\n');
		var lastBlock = null;
		this.block_tree = []
		for(let line of lines){
			for(let block of MarkdownConfig.BlockParsers) {
				if(block.test(line)) {
					var tmp = block.parse(line,lastBlock,this);
					if(tmp!=null) {
						lastBlock = tmp;
						lastBlock.bindMarkdown(this);
						this.block_tree.push(lastBlock);
					}
					break;
				}
			}
		}
		var result = [];
		for(let block of this.block_tree) {
			result.push(block.render());
		}
		return result;
	}

	addRef(block) {
		this.refs[block.id] = {
			link: block.link,
			title: block.title
		}
	}

}

export default MarkdownParser;
