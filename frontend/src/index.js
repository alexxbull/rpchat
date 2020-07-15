import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from 'react-router-dom';

// context
import { StoreProvider } from './context/Store';

// components
import App from './App.js';
import Login from './containers/Login/Login.js'
import Register from './containers/Register/Register';
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Route path="/" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Route path="/chat" exact component={App} />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
