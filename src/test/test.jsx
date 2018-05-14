import React, { Component } from 'react';
import 'style-loader!./test.less';

export default class Test extends Component {
	constructor(props) {
		super(props);
	}

	handleClick = () => {
		alert(1);
	}

	render() {
		return (
			<div className="btn" onClick={this.handleClick}>点我弹alert</div>
		);
	}
}