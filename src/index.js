import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Router, withRouter } from 'react-router-dom';
import App from './app';
import { readCookie } from './config/shared';
import './css/grid.min.css';
import './css/main.css';
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
}

const history = createBrowserHistory();

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_GA_TRACKING_ID && readCookie('user-has-accepted-cookies') === 'true') {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID, { debug: process.env.NODE_ENV === "production" ? false : true });
  ReactGA.pageview(window.location.pathname);
  history.listen(location => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  });
}

class ScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}

export default withRouter(ScrollToTop);

ReactDOM.render(
	<Router history={history}>
		<ScrollToTop>
      <App/>
    </ScrollToTop>
	</Router>,
	document.getElementById('root')
);
serviceWorker.register();