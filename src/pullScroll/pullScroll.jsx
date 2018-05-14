import React, { Component } from 'react';

export default class PullScroll extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>{this.props.text || 'props'}</div>
		);
	}
}