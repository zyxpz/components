import React from 'react';
import ReactDOM from 'react-dom';
import { Test } from '../index.js';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <Test />
        <div>1</div>
      </div>
    )
  }

}

ReactDOM.render(
  <App />,
  document.querySelector('.rootApp')
)