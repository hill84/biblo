import React from 'react';
import { muiTheme } from './config/shared';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import BookForm from './components/forms/bookForm';
import Book from './components/pages/book';
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
			uid: null,
			user: null
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				window.localStorage.setItem(storageKey, user.uid);
				userRef(user.uid).onSnapshot(snap => {
					if (snap.data() !== null) {
						this.setState({ 
							user: snap.data(), 
							uid: user.uid 
						});
					}
        });
			} else {
				window.localStorage.removeItem(storageKey);
				this.setState({ 
					user: null, 
					uid: null 
				});
			}
		});
	}

	render() {
		const { user, uid } = this.state;

		return (
			<MuiThemeProvider muiTheme={muiTheme} id="appComponent">
				<Layout user={user} uid={uid}>
					<Switch>
						<Route path="/" exact component={Home} uid={uid} />
						<PrivateRoute path="/dashboard/:uid" component={Dashboard} user={user} uid={uid} />
						<Route path="/login" component={Login} />
						<PrivateRoute path="/books/add" component={AddBook} user={user} uid={uid} />
						<PrivateRoute path="/book/edit/:book" component={BookForm} uid={uid} />
						<PrivateRoute path="/book/:book" component={Book} user={user} uid={uid} />
						<PrivateRoute path="/new-book" component={NewBook} />
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