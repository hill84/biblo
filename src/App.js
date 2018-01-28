import React from 'react';
import PropTypes from 'prop-types';
import { muiTheme } from './config/shared';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import BookProfile from './components/pages/bookProfile';
import Dashboard from './components/pages/dashboard';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import PasswordResetForm from './components/forms/passwordResetForm';
import NoMatch from './components/pages/nomatch';
import { auth, storageKey, isAuthenticated, userRef } from './config/firebase';

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			uid: null,
			user: null
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				window.localStorage.setItem(storageKey, user.uid);
				userRef(user.uid).get().then(doc => {
					if (doc.exists) {
						this.setState({ user: doc.data(), uid: user.uid });
					}
        });
			} else {
				window.localStorage.removeItem(storageKey);
				this.setState({ user: null, uid: null });
			}
		});
	}

	render() {
		const { user, uid } = this.state;

		return (
			<MuiThemeProvider muiTheme={muiTheme} id="appComponent">
				<Layout user={user}>
					<Switch>
						<Route path="/" exact component={Home} />
						<PrivateRoute path="/dashboard" component={Dashboard} user={user} uid={uid} />
						<Route path="/login" component={Login} />
						<PrivateRoute path="/books/add" component={AddBook} uid={uid} />
						<PrivateRoute path="/book/:title" component={BookProfile} uid={uid} />
						<Route path="/password-reset" component={PasswordResetForm} />
						<PrivateRoute path="/profile" exact component={Profile} uid={uid} />
						<Route path="/signup" component={Signup} />

						<Redirect from="/home" to="/" />
						<Route component={NoMatch} />
					</Switch>
				</Layout>
			</MuiThemeProvider>
		);
	}
}

const PrivateRoute = ({component: Component, ...rest}) => (
	<Route {...rest} render={props => (
		isAuthenticated() ?
			<Component {...props} {...rest} />
		:
			<Redirect to={{ pathname: '/login', state: {from: props.location} }} />
	)} />
)

App.PropTypes = {
	uid: PropTypes.string
}