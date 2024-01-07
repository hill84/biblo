import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/styles';
import type { FC, PropsWithChildren } from 'react';
import { Suspense, lazy, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import type { RouteProps } from 'react-router-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/errorBoundary';
import Layout from './components/layout';
import AddBook from './components/pages/addBook';
import AuthorPage from './components/pages/authorPage';
import AuthorsPage from './components/pages/authorsPage';
import BookContainer from './components/pages/bookContainer';
import Collection from './components/pages/collection';
import Dashboard from './components/pages/dashboard';
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
const NoMatch = lazy(() => import('./components/noMatch'));
const Notifications = lazy(() => import('./components/pages/notifications'));
const PasswordResetForm = lazy(() => import('./components/forms/passwordResetForm'));
const PrivacyPage = lazy(() => import('./components/pages/privacyPage'));
const TermsPage = lazy(() => import('./components/pages/termsPage'));
const VerifyEmailPage = lazy(() => import('./components/pages/verifyEmailPage'));

const suspenseFallback = (
  <div aria-hidden='true' className='loader'>
    <CircularProgress />
  </div>
);

const App: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <Suspense fallback={suspenseFallback}>
      <BrowserRouter>
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
                    <Routes>
                      <Route path='/' element={<Home />} /> {/* exact */}
                      <Route path='about/*' element={<AboutPage />} />
                      <Route path='author/:aid' element={<AuthorPage />} />
                      <Route path='book/:bid/*' element={<BookContainer />} />
                      <Route path='challenges' element={<NewFeature />} />
                      <Route path='collection/:cid' element={<Collection />} />
                      <Route path='collections' element={<NewFeature />} />
                      <Route path='cookie' element={<CookiePage />} />
                      <Route path='dashboard/:uid' element={<DashboardProvider><Dashboard /></DashboardProvider>} /> {/* exact */}
                      <Route path='dashboard/:uid/:tab' element={<DashboardProvider><Dashboard /></DashboardProvider>} />
                      <Route path='donations' element={<DonationsPage />} />
                      <Route path='genre/:gid' element={<Genre />} />
                      <Route path='genres' element={<GenresPage />} />
                      <Route path='group/:gid' element={<GroupProvider><Group /></GroupProvider>} />
                      <Route path='groups' element={<GroupProvider><Groups /></GroupProvider>} />
                      <Route path='help' element={<HelpPage />} />
                      <Route path='icons' element={<IconsPage />} />
                      <Route path='login' element={<Login />} />
                      <Route path='password-reset' element={<PasswordResetForm />} />
                      <Route path='privacy' element={<PrivacyPage />} />
                      <Route path='signup' element={<Signup />} />
                      <Route path='terms' element={<TermsPage />} />
                      <Route path='verify-email' element={<VerifyEmailPage />} />
                      <Route path='authors' element={<AuthorsPage openSnackbar={openSnackbar} />} /> {/* CLASS */}
                      {/* PRIVATE ROOTS */}
                      <Route path='admin/:tab' element={<PrivateRoute><Admin /></PrivateRoute>} />
                      <Route path='books/add' element={<PrivateRoute><AddBook /></PrivateRoute>} />
                      <Route path='challenge' element={<PrivateRoute><Challenge /></PrivateRoute>} />
                      <Route path='new-book' element={<PrivateRoute><NewBook /></PrivateRoute>} />
                      <Route path='notifications' element={<PrivateRoute><Notifications /></PrivateRoute>} />
                      <Route path='profile' element={<PrivateRoute><Profile /></PrivateRoute>}/>
                      {/* REDIRECTS */}
                      <Route path='aiuto' element={<Navigate to='/help' replace />} />
                      <Route path='chi-siamo' element={<Navigate to='/about' replace />} />
                      <Route path='home' element={<Navigate to='/' replace />} />
                      <Route path='admin/*' element={<PrivateRoute><Admin /></PrivateRoute>} />
                      <Route path='webmaster/*' element={<Navigate to='/' replace />} />
                      <Route path='*' element={<NoMatch />} />
                    </Routes>
                  </ErrorBoundary>
                </Layout>
              </UserProvider>
            </SnackbarProvider>
          </HelmetProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;

const PrivateRoute: FC<PropsWithChildren<RouteProps>> = ({ children }) => {
  const { isAuth } = useContext(UserContext);

  return isAuth ? <>{children}</> : <Navigate to='/login' />;
};