import React, { Component } from 'react';

export default class Test extends Component {
	constructor(props) {
		super(props);
	}

  handleClick = () => {
  	alert(1);
  } 

  render() {
  	return (
  		<div onClick={this.handleClick}>点我弹alert</div>
  	);
  }
}