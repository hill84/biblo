import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Redirect, Route, Switch } from 'react-router-dom';
import PasswordResetForm from './components/forms/passwordResetForm';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import BookContainer from './components/pages/bookContainer';
import Collection from './components/pages/collection';
import Dashboard from './components/pages/dashboard';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NewBook from './components/pages/newBook';
import NoMatchPage from './components/pages/noMatchPage';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import { auth, isAuthenticated, storageKey_uid, userRef } from './config/firebase';
import { muiTheme } from './config/shared';

export const UserContext = React.createContext();

export default class App extends React.Component {
	constructor(props){
    super(props);
    this.state = {
			user: null
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				window.localStorage.setItem(storageKey_uid, user.uid);
				userRef(user.uid).onSnapshot(snap => {
					if (snap.exists) {
						this.setState({ user: snap.data() });
					}
        });
			} else {
				window.localStorage.removeItem(storageKey_uid);
				this.setState({ user: null });
			}
		});
	}

	render() {
		const { user } = this.state;

		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<UserContext.Provider value={user}>
					<Layout user={user}>
						<Switch>
							<Route path="/" exact component={Home} />
							<Route path="/login" component={Login} />
							<Route path="/password-reset" component={PasswordResetForm} />
							<Route path="/signup" component={Signup} />
							<Route path="/collection/:cid" component={Collection} />
							<Route path="/dashboard/:uid" component={Dashboard} user={user} />
							<Route path="/book/:bid" component={BookContainer} />
							<PrivateRoute path="/books/add" component={AddBook} user={user} />
							<PrivateRoute path="/new-book" component={NewBook} user={user} />
							<PrivateRoute path="/profile" exact component={Profile} />
							<Redirect from="/home" to="/" />
							<Route component={NoMatchPage} />
						</Switch>
					</Layout>
				</UserContext.Provider>
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