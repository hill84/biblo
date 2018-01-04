import React from 'react';
import { muiTheme } from './config/shared';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './components/pages/dashboard';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NewBook from './components/pages/newBook';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import PasswordResetForm from './components/forms/passwordResetForm';
import NoMatch from './components/pages/nomatch';
import { auth, storageKey, isAuthenticated, userRef } from './config/firebase';

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
				userRef(user.uid).on('value', snap => {
          this.setState({ user: snap.val() });
        });
			} else {
				window.localStorage.removeItem(storageKey);
				this.setState({ user: null });
			}
		});
	}

	render() {
		return (
			<MuiThemeProvider muiTheme={muiTheme} id="appComponent">
				<Layout user={this.state.user}>
					<Switch>
						<Route path="/" exact component={Home} />
						<PrivateRoute path="/dashboard" component={Dashboard} />
						<Route path="/login" component={Login} />
						<PrivateRoute path="/books/new" component={NewBook} />
						<Route path="/password-reset" component={PasswordResetForm} />
						<PrivateRoute path="/profile" exact component={Profile} />
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
		isAuthenticated() ? (
			<Component {...props} {...rest} />
		) : (
			<Redirect to={{
				pathname: '/login',
				state: {from: props.location}
			}} />
		)
	)}/>
)