import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from 'react-router-dom';

// css
import './index.css';

// context
import { StoreProvider } from './context/Store.js';

// components
import App from './App.js';
import Login from './containers/Login/Login.js'
import Register from './containers/Register/Register.js';
import ErrorPage from './components/ErrorPage/ErrorPage.js'
import AboutPage from './components/AboutPage/AboutPage.js'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Route path="/" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Route path="/chat" exact component={App} />
        <Route path="/error" exact component={ErrorPage} />
        <Route path="/about" exact component={AboutPage} />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
