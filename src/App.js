import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NoMatch from './components/pages/nomatch';

const App = () => (
	<div id="appComponent">
		<Layout>
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/login" exact component={Login} />
				<Redirect from="/home" to="/"/>
				<Route component={NoMatch}/>
			</Switch>
		</Layout>
	</div>
);

export default App;