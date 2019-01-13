import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import App from './app';
import './css/grid.min.css';
import './css/main.css';
import registerServiceWorker from './registerServiceWorker';

if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
}

ReactDOM.render(
	<Router history={createBrowserHistory()}>
		<App />
	</Router>,
	document.getElementById('root')
);
registerServiceWorker();