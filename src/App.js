import React from 'react';
import { Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Login from './components/pages/Login';

const App = () => (
	<div className="ui container">
		<Route path="/" exact component={Home} />
		<Route path="/login" exact component={Login} />
	</div>
);

export default App;
