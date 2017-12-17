import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './app';
import registerServiceWorker from './registerServiceWorker';
import './css/grid.min.css';
import './css/main.css';

const history = createBrowserHistory();

ReactDOM.render(
	<MuiThemeProvider>
		<Router history={history}>
			<App />
		</Router>
	</MuiThemeProvider>,
	document.getElementById('root')
);
registerServiceWorker();