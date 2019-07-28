import React, {Component} from 'react';
import MarkdownParser from './MarkdownParser';

class Markdown extends Component {
	render() {
		var mdp = new MarkdownParser();
		return mdp.parse(this.props.src);
	}
}

export default Markdown;
