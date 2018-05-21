## code

```css
 body {
   -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
 }
```


```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta content="yes" name="apple-mobile-web-app-capable"/>
  <meta content="yes" name="apple-touch-fullscreen"/>
  <meta content="telephone=no,email=no" name="format-detection"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
<body>
<div class="rootApp"></div>
</body>
</html>
```

```js
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
        <div>3</div>
      </div>
    )
  }
  
}

ReactDOM.render(
  <App />,
  document.querySelector('.rootApp')
)
```

## API
