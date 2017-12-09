import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NoMatch from './components/pages/nomatch';

const App = () => (
	<div className="container">
		<Switch>
			<Route path="/" exact component={Home} />
			<Route path="/login" exact component={Login} />
			<Redirect from="/home" to="/"/>
            <Route component={NoMatch}/>
		</Switch>
	</div>
);

export default App;