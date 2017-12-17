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
import { auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, storageKey, isAuthenticated } from './config/firebase.js';

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			user: null,
			loading: false
		}
	}

    logout = () => {
        auth.signOut()
        .then(() => this.setState({ user: null }) );
	}
	socialAuth = provider => {
		this.setState({ loading: true });
        auth.signInWithPopup(provider) 
            .then(result => {
            const user = result.user;
			this.setState({ user, loading: false });
		});
		setTimeout(() => this.setState({ loading: false }), 3000);
	}
	googleAuth = () => this.socialAuth(GoogleAuthProvider);
	facebookAuth = () => this.socialAuth(FacebookAuthProvider);
	twitterAuth = () => this.socialAuth(TwitterAuthProvider);

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
				<Layout 
					user={this.state.user} 
					loading={this.state.loading} 
					googleAuth={this.googleAuth} 
					facebookAuth={this.facebookAuth} 
					twitterAuth={this.twitterAuth} 
					logout={this.logout}>
					<Switch>
						<Route path="/" exact component={Home} />
						<PrivateRoute path="/dashboard" component={Dashboard} />
						<Route path="/login" component={Login} />
						<Route path="/password-reset" component={PasswordResetForm} />
						<Route path="/profile" exact component={Profile} />
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