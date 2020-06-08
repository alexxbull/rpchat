import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './App.js';
import Login from './containers/Login/Login.js'
import Register from './containers/Register/Register';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Route path="/" exact component={Login} />
      <Route path="/signup" exact component={Register} />
      <Route path="/chat" exact component={App} />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
