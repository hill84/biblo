import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './app';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';
import './css/grid.min.css';
import './css/main.css';

var config = {
	apiKey: "AIzaSyDmzwyXa4bBotGhyXN3r5ZAchDmua8a5i0",
	authDomain: "delibris-4fa3b.firebaseapp.com",
	databaseURL: "https://delibris-4fa3b.firebaseio.com",
	projectId: "delibris-4fa3b",
	storageBucket: "delibris-4fa3b.appspot.com",
	messagingSenderId: "144759497905"
};
firebase.initializeApp(config);

ReactDOM.render(
	<MuiThemeProvider>
		<Router>
			<App />
		</Router>
	</MuiThemeProvider>,
	document.getElementById('root')
);
registerServiceWorker();