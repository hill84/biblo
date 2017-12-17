import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './components/pages/dashboard';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import PasswordResetForm from './components/forms/passwordResetForm';
import NoMatch from './components/pages/nomatch';
import { auth, storageKey, isAuthenticated } from './config/firebase.js';

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			user: null
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				window.localStorage.setItem(storageKey, user.uid);
				this.setState({ user });
			} else {
				window.localStorage.removeItem(storageKey);
				this.setState({ user: null });
			}
		});
	}

	render() {
		return (
			<div id="appComponent">
				<Layout user={this.state.user}>
					<Switch>
						<Route path="/" exact component={Home} />
						<PrivateRoute path="/dashboard" component={Dashboard} />
						<Route path="/login" component={Login} />
						<Route path="/password-reset" component={PasswordResetForm} />
						<PrivateRoute path="/profile" exact component={Profile} />
						<Route path="/signup" component={Signup} />

						<Redirect from="/home" to="/" />
						<Route component={NoMatch} />
					</Switch>
				</Layout>
			</div>
		);
	}
}

const PrivateRoute = ({component: Component, ...rest}) => (
	<Route {...rest} render={props => (
		isAuthenticated() ? (
			<Component {...props} />
		) : (
			<Redirect to={{
				pathname: '/login',
				state: {from: props.location}
			}} />
		)
	)}/>
)