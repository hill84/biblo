import React from 'react';
import { muiTheme } from './config/shared';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import BookContainer from './components/pages/bookContainer';
import Collection from './components/pages/collection';
import Dashboard from './components/pages/dashboard';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NewBook from './components/pages/newBook';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import PasswordResetForm from './components/forms/passwordResetForm';
import NoMatch from './components/pages/nomatch';
import { auth, isAuthenticated, storageKey_uid, userRef } from './config/firebase';

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
				window.localStorage.setItem(storageKey_uid, user.uid);
				userRef(user.uid).onSnapshot(snap => {
					if (snap.exists) {
						this.setState({ 
							user: snap.data(), 
							uid: user.uid 
						});
					}
        });
			} else {
				window.localStorage.removeItem(storageKey_uid);
				this.setState({ 
					user: null, 
					uid: null 
				});
			}
		});
	}

	render() {
		const { user } = this.state;

		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<Layout user={user}>
					<Switch>
						<Route path="/" exact component={Home} />
						<Route path="/login" component={Login} />
						<Route path="/password-reset" component={PasswordResetForm} />
						<Route path="/signup" component={Signup} />
						<Route path="/collection/:cid" component={Collection} />
						<PrivateRoute path="/books/add" component={AddBook} user={user} />
						<PrivateRoute path="/book/:bid" component={BookContainer} user={user} />
						<PrivateRoute path="/dashboard/:uid" component={Dashboard} user={user} />
						<PrivateRoute path="/new-book" component={NewBook} />
						<PrivateRoute path="/profile" exact component={Profile} />
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