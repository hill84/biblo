import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/styles';
import React, { lazy, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './components/errorBoundary';
import PasswordResetForm from './components/forms/passwordResetForm';
import Layout from './components/layout';
import NewFeature from './components/newFeature';
import AboutPage from './components/pages/aboutPage';
import AddBook from './components/pages/addBook';
import AuthorPage from './components/pages/authorPage';
import AuthorsPage from './components/pages/authorsPage';
import BookContainer from './components/pages/bookContainer';
import CookiePage from './components/pages/cookiePage';
import DonationsPage from './components/pages/donationsPage';
import Genre from './components/pages/genre';
import genresPage from './components/pages/genresPage';
import HelpPage from './components/pages/helpPage';
import Home from './components/pages/home';
import Login from './components/pages/login';
import NoMatchPage from './components/pages/noMatchPage';
import Notifications from './components/pages/notifications';
import PrivacyPage from './components/pages/privacyPage';
import Signup from './components/pages/signup';
import TermsPage from './components/pages/termsPage';
import VerifyEmailPage from './components/pages/verifyEmailPage';
import { auth, isAuthenticated, storageKey_uid, userRef } from './config/firebase';
import { app, handleFirestoreError, needsEmailVerification } from './config/shared';
import { defaultTheme } from './config/themes';
import { SharedSnackbarConsumer, SharedSnackbarProvider } from './context/snackbarContext';
import { Helmet } from 'react-helmet';

const Admin = lazy(() => import('./components/pages/admin/admin'));
const Challenge = lazy(() => import('./components/pages/challenge'));
// const Challenges = lazy(() => import('./components/pages/challenges'));
const Collection = lazy(() => import('./components/pages/collection'));
const Dashboard = lazy(() => import('./components/pages/dashboard'));
const IconsPage = lazy(() => import('./components/pages/iconsPage'));
const NewBook = lazy(() => import('./components/pages/newBook'));
const Profile = lazy(() => import('./components/pages/profile'));

export default class App extends React.Component {
	state = {
    error: null,
		user: null
	}

	componentDidMount() {
    this._isMounted = true; 
    this.initUser();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubUserFetch && this.unsubUserFetch();
  }

  initUser = () => {
    auth.onIdTokenChanged(user => {
      if (user) {
        // console.log(user);
        if (needsEmailVerification(user)) {
          this.clearUser();
        } else {
          this.setUser(user);
        }
      } else {
        this.clearUser();
      }
		});
  }

  clearUser = () => {
    if (this._isMounted) {
      this.setState({ user: null }, () => localStorage.removeItem(storageKey_uid));
    }
  }

  setUser = user => {
    this.unsubUserFetch = userRef(user.uid).onSnapshot(snap => {
      // console.log(snap);
      if (snap.exists) {
        this.setState({ user: snap.data(), error: null }, () => localStorage.setItem(storageKey_uid, user.uid));
      } else console.warn(`User not found in database`);
    }, err => {
      if (this._isMounted) this.setState({ error: handleFirestoreError(err) });
    });
  }

	render() {
    const { error, user } = this.state;

		return (
			<ThemeProvider theme={defaultTheme}>
        <Helmet>
          <title>{app.name}</title>
          <meta property="og:title" content={app.name} />
          <meta property="og:url" content={app.url} />
          <meta property="og:image" content={`${app.url}/img/og-image.jpg`} />
          <meta property="og:description" content={app.desc} />
          <meta name="description" content={app.desc} />
        </Helmet>
        <SharedSnackbarProvider>
          <SharedSnackbarConsumer>
            {({ openSnackbar }) => (
              <Layout user={user} error={error} openSnackbar={openSnackbar}>
                <ErrorBoundary>
                  <Suspense fallback={<div aria-hidden="true" className="loader"><CircularProgress /></div>}>
                    <Switch>
                      <RouteWithProps path="/" exact component={Home} openSnackbar={openSnackbar} />
                      <Route path="/about" component={AboutPage} />
                      <Route path="/cookie" component={CookiePage} />
                      <Route path="/donations" component={DonationsPage} />
                      <Route path="/help" component={HelpPage} />
                      <Route path="/privacy" component={PrivacyPage} />
                      <Route path="/terms" component={TermsPage} />
                      <RouteWithProps path="/verify-email" component={VerifyEmailPage} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/password-reset" component={PasswordResetForm} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/login" component={Login} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/signup" component={Signup} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/author/:aid" component={AuthorPage} user={user} />
                      <RouteWithProps path="/genres" component={genresPage} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/authors" component={AuthorsPage} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/collection/:cid" component={Collection} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/collections" component={NewFeature} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/genre/:gid" component={Genre} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/book/:bid" component={BookContainer} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/dashboard/:uid" exact component={Dashboard} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/dashboard/:uid/:tab" component={Dashboard} user={user} openSnackbar={openSnackbar} />
                      <RouteWithProps path="/icons" component={IconsPage} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/books/add" component={AddBook} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/new-book" component={NewBook} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/notifications" component={Notifications} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/profile" exact component={Profile} openSnackbar={openSnackbar}/>
                      <PrivateRoute path="/admin" exact component={Admin} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/admin/:tab" component={Admin} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/challenge" component={Challenge} user={user} openSnackbar={openSnackbar} />
                      <PrivateRoute path="/challenges" component={NewFeature} user={user} openSnackbar={openSnackbar} />
                      <Redirect from="/home" to="/" />
                      <Redirect from="/webmaster/*" to="/" />
                      <Redirect from="/chi-siamo" to="/about" />
                      <Redirect from="/aiuto" to="/help" />
                      <Route component={NoMatchPage} status={404} />
                    </Switch>
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            )}
          </SharedSnackbarConsumer>
        </SharedSnackbarProvider>
			</ThemeProvider>
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
);

const RouteWithProps = ({ path, exact, strict, component:Component, location, ...rest }) => (
  <Route
    path={path}
    exact={exact}
    strict={strict}
    location={location}
    render={props => <Component {...props} {...rest} />} 
	/>
);