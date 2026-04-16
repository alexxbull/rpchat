import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// css
import './index.css';

// context
import { StoreProvider } from './context/Store';

// components
import App from './App.jsx';
import Login from './containers/Login/Login.jsx'
import Register from './containers/Register/Register.jsx';
import ErrorPage from './components/ErrorPage/ErrorPage.jsx'
import AboutPage from './components/AboutPage/AboutPage.jsx'

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        {/* <Route path="/" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Route path="/chat" exact component={App} />
        <Route path="/error" exact component={ErrorPage} />
        <Route path="/about" exact component={AboutPage} /> */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<App />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Catch-all for 404s */}
          <Route path="*" element={<ErrorPage />} />
      </Routes>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
