import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './app';
import registerServiceWorker from './registerServiceWorker';
import './css/grid.min.css';
import './css/main.css';

ReactDOM.render(
	<MuiThemeProvider>
		<Router>
			<App />
		</Router>
	</MuiThemeProvider>,
	document.getElementById('root')
);
registerServiceWorker();