import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/styles';
import React, { FC, lazy, Suspense, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import ErrorBoundary from './components/errorBoundary';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import AuthorPage from './components/pages/authorPage';
import AuthorsPage from './components/pages/authorsPage';
import BookContainer from './components/pages/bookContainer';
import Collection from './components/pages/collection';
import Dashboard, { DashboardProps } from './components/pages/dashboard';
import Genre from './components/pages/genre';
import GenresPage from './components/pages/genresPage';
import Group from './components/pages/group';
import Groups from './components/pages/groups';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import { app } from './config/shared';
import { defaultTheme } from './config/themes';
import { DashboardProvider } from './context/dashboardContext';
import { GroupProvider } from './context/groupContext';
import SnackbarContext, { SnackbarProvider } from './context/snackbarContext';
import UserContext, { UserProvider } from './context/userContext';

const Admin = lazy(() => import('./components/pages/admin/admin'));
const AboutPage = lazy(() => import('./components/pages/aboutPage'));
const Challenge = lazy(() => import('./components/pages/challenge'));
// const Challenges = lazy(() => import('./components/pages/challenges'));
const CookiePage = lazy(() => import('./components/pages/cookiePage'));
const DonationsPage = lazy(() => import('./components/pages/donationsPage'));
const HelpPage = lazy(() => import('./components/pages/helpPage'));
const IconsPage = lazy(() => import('./components/pages/iconsPage'));
const NewBook = lazy(() => import('./components/pages/newBook'));
const NewFeature = lazy(() => import('./components/newFeature'));
const NoMatchPage = lazy(() => import('./components/pages/noMatchPage'));
const Notifications = lazy(() => import('./components/pages/notifications'));
const PasswordResetForm = lazy(() => import('./components/forms/passwordResetForm'));
const PrivacyPage = lazy(() => import('./components/pages/privacyPage'));
const TermsPage = lazy(() => import('./components/pages/termsPage'));
const VerifyEmailPage = lazy(() => import('./components/pages/verifyEmailPage'));

const DashboardRender: FC<DashboardProps> = (props: DashboardProps) => (
  <DashboardProvider>
    <Dashboard {...props} />
  </DashboardProvider>
);

const App: FC = () => (
  <ThemeProvider theme={defaultTheme}>
    <HelmetProvider>
      <Helmet>
        <title>{app.name}</title>
        <meta property='og:title' content={app.name} />
        <meta property='og:url' content={app.url} />
        <meta property='og:image' content={`${app.url}/img/og-image.jpg`} />
        <meta property='og:description' content={app.desc} />
        <meta name='description' content={app.desc} />
      </Helmet>
      <SnackbarProvider>
        <UserProvider>
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={(
                <div aria-hidden='true' className='loader'>
                  <CircularProgress />
                </div>
              )}>
                <Switch>
                  <Route path='/' exact component={Home} />
                  <Route path='/about' component={AboutPage} />
                  <Route path='/author/:aid' component={AuthorPage} />
                  <Route path='/book/:bid' component={BookContainer} />
                  <Route path='/challenges' component={NewFeature} />          
                  <Route path='/collection/:cid' component={Collection} />
                  <Route path='/collections' component={NewFeature} />
                  <Route path='/cookie' component={CookiePage} />
                  <Route path='/dashboard/:uid' exact render={DashboardRender} />
                  <Route path='/dashboard/:uid/:tab' render={DashboardRender} />
                  <Route path='/donations' component={DonationsPage} />
                  <Route path='/genre/:gid' component={Genre} />
                  <Route path='/genres' component={GenresPage} />
                  <Route path='/group/:gid' render={props => <GroupProvider><Group {...props} /></GroupProvider>} />
                  <Route path='/groups' component={() => <GroupProvider><Groups /></GroupProvider>} />
                  <Route path='/help' component={HelpPage} />
                  <Route path='/icons' component={IconsPage} />
                  <Route path='/login' component={Login} />
                  <Route path='/password-reset' component={PasswordResetForm} />
                  <Route path='/privacy' component={PrivacyPage} />
                  <Route path='/signup' component={Signup} />
                  <Route path='/terms' component={TermsPage} />
                  <Route path='/verify-email' component={VerifyEmailPage} />
                  <RouteWithProps path='/authors' component={AuthorsPage} /> {/* CLASS */}
                  <PrivateRoute path='/admin' exact component={Admin} />
                  <PrivateRoute path='/admin/:tab' component={Admin} />
                  <PrivateRoute path='/books/add' component={AddBook} />
                  <PrivateRoute path='/challenge' component={Challenge} />
                  <PrivateRoute path='/new-book' component={NewBook} />
                  <PrivateRoute path='/notifications' component={Notifications} />
                  <PrivateRoute path='/profile' component={Profile}/>
                  <Redirect from='/aiuto' to='/help' />
                  <Redirect from='/chi-siamo' to='/about' />
                  <Redirect from='/home' to='/' />
                  <Redirect from='/webmaster/*' to='/' />
                  <Route component={NoMatchPage} />
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

interface PrivateRouteProps extends RouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const { isAuth } = useContext(UserContext);
  
  return (
    <Route {...rest} render={props => (
      isAuth ? (
        <Component {...props} {...rest} />
      ) : (
        <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
      )
    )} />
  );
};

const RouteWithProps: FC<PrivateRouteProps> = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <Route render={props => <Component openSnackbar={openSnackbar} {...props} {...rest} />} />
  );
};