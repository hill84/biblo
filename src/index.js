import React from 'react';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
import App from './app';
import './css/grid.min.css';
import './css/main.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './i18n';

if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();