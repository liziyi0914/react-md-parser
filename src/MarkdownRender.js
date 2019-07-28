import React, {Component} from 'react';
import MarkdownConfig from './MarkdownConfig';

class MarkdownRender {

	static init() {
		MarkdownConfig.Renders = {
			h: H,
			p: P,
			br: Br,
			ul: UList,
			ol: OList,
			quote: Quote,
			link: Link,
			image: Image,
			em: Em,
			strong: Strong,
			code: Code
		};
	}

}

class H extends Component {

	static defaultProps = {
		level: 1
	};

	render() {
		var level = this.props.level;
		return React.createElement('h'+level,null,this.props.children);
	}

}

class P extends Component {

	render() {
		return <p>{this.props.children}</p>;
	}

}

class Br extends Component {

	render() {
		return <br/>;
	}

}

class UList extends Component {

	render() {
		var list = this.props.list;
		return (
			<ul>
			{list.map((it)=><li>{it}</li>)}
			</ul>
		);
	}

}

class OList extends Component {

	render() {
		var list = this.props.list;
		return (
			<ol>
			{list.map((it)=><li>{it}</li>)}
			</ol>
		);
	}

}

class Quote extends Component {

	render() {
		return (<blockquote>{this.props.children}</blockquote>);
	}

}

class Link extends Component {

	render() {
		return <a href={this.props.to} title={this.props.title}>{this.props.children}</a>;
	}

}

class Image extends Component {

	render() {
		return <img src={this.props.src} alt={this.props.alt}/>;
	}

}

class Em extends Component {

	render() {
		return <em>{this.props.children}</em>;
	}

}

class Strong extends Component {

	render() {
		return <strong>{this.props.children}</strong>;
	}

}

class Code extends Component {

	render() {
		return <code>{this.props.children}</code>;
	}

}

export {
	MarkdownRender,
	H,
	P,
	Br,
	UList,
	OList,
	Quote,
	Link,
	Image,
	Em,
	Strong,
	Code
};
