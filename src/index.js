import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import App from './app';
import './css/grid.min.css';
import './css/main.css';
import registerServiceWorker from './registerServiceWorker';

const history = createBrowserHistory();

ReactDOM.render(
	<Router history={history}>
		<App />
	</Router>,
	document.getElementById('root')
);
registerServiceWorker();