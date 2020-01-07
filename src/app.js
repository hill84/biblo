import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/styles';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
import { isAuthenticated } from './config/firebase';
import { app } from './config/shared';
import { defaultTheme } from './config/themes';
import { locationType } from './config/types';
import SnackbarContext, { SnackbarProvider } from './context/snackbarContext';
import { UserProvider } from './context/userContext';

const Admin = lazy(() => import('./components/pages/admin/admin'));
const Challenge = lazy(() => import('./components/pages/challenge'));
// const Challenges = lazy(() => import('./components/pages/challenges'));
const Collection = lazy(() => import('./components/pages/collection'));
const Dashboard = lazy(() => import('./components/pages/dashboard'));
const IconsPage = lazy(() => import('./components/pages/iconsPage'));
const NewBook = lazy(() => import('./components/pages/newBook'));
const Profile = lazy(() => import('./components/pages/profile'));

const App = () => (
  <ThemeProvider theme={defaultTheme}>
    <HelmetProvider>
      <Helmet>
        <title>{app.name}</title>
        <meta property="og:title" content={app.name} />
        <meta property="og:url" content={app.url} />
        <meta property="og:image" content={`${app.url}/img/og-image.jpg`} />
        <meta property="og:description" content={app.desc} />
        <meta name="description" content={app.desc} />
      </Helmet>
      <SnackbarProvider>
        <UserProvider>
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={<div aria-hidden="true" className="loader"><CircularProgress /></div>}>
                <Switch>
                  <Route path="/" exact component={Home} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/cookie" component={CookiePage} />
                  <Route path="/donations" component={DonationsPage} />
                  <Route path="/help" component={HelpPage} />
                  <Route path="/privacy" component={PrivacyPage} />
                  <Route path="/terms" component={TermsPage} />
                  <Route path="/verify-email" component={VerifyEmailPage} />
                  <Route path="/password-reset" component={PasswordResetForm} />
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/author/:aid" component={AuthorPage} />
                  <Route path="/genres" component={genresPage} />
                  <RouteWithProps path="/authors" component={AuthorsPage} /> {/* CLASS */}
                  <Route path="/collection/:cid" component={Collection} />
                  <Route path="/collections" component={NewFeature} />
                  <Route path="/genre/:gid" component={Genre} />
                  <Route path="/book/:bid" component={BookContainer} />
                  <Route path="/dashboard/:uid" exact component={Dashboard} />
                  <Route path="/dashboard/:uid/:tab" component={Dashboard} />
                  <Route path="/icons" component={IconsPage} />
                  <PrivateRoute path="/books/add" component={AddBook} />
                  <PrivateRoute path="/new-book" component={NewBook} />
                  <PrivateRoute path="/notifications" component={Notifications} />
                  <PrivateRoute path="/profile" exact component={Profile}/>
                  <PrivateRoute path="/admin" exact component={Admin} />
                  <PrivateRoute path="/admin/:tab" component={Admin} />
                  <PrivateRoute path="/challenge" component={Challenge} />
                  <Route path="/challenges" component={NewFeature} />          
                  <Redirect from="/home" to="/" />
                  <Redirect from="/webmaster/*" to="/" />
                  <Redirect from="/chi-siamo" to="/about" />
                  <Redirect from="/aiuto" to="/help" />
                  <Route component={NoMatchPage} status={404} />
                </Switch>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </UserProvider>
      </SnackbarProvider>
    </HelmetProvider>
  </ThemeProvider>
);
 
export default App;

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    isAuthenticated() ?
      <Component {...props} {...rest} />
    :
      <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  )} />
);

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]).isRequired,
  location: locationType
}

PrivateRoute.defaultProps = {
  location: { pathname: '' },
};

const RouteWithProps = ({ path, exact, strict, component: Component, location, ...rest }) => {
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <Route
      exact={exact}
      location={location}
      path={path}
      render={props => <Component openSnackbar={openSnackbar} {...props} {...rest} />} 
      strict={strict}
    />
  );
};

RouteWithProps.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]).isRequired,
  exact: PropTypes.bool,
  location: locationType,
  path: PropTypes.string.isRequired,
  strict: PropTypes.bool
};

RouteWithProps.defaultProps = {
  exact: false,
  location: { pathname: '' },
  strict: false
};