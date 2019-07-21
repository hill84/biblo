import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Router } from 'react-router-dom';
import App from './app';
import { readCookie } from './config/shared';
import './css/grid.min.css';
import './css/main.css';
import * as serviceWorker from './serviceWorker';
import BrowserNotSupported from './components/browser-not-supported';

function getInternetExplorerVersion() {
  var rv = -1;
  var ua;
  var re
  if (navigator.appName === 'Microsoft Internet Explorer') {
    ua = navigator.userAgent;
    re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
    if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
  } else if (navigator.appName === 'Netscape') {
    ua = navigator.userAgent;
    re  = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
    if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

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

ReactDOM.render(
	<Router history={history}>
    {getInternetExplorerVersion() !== -1 ? <BrowserNotSupported /> : <App/>}
	</Router>,
	document.getElementById('root')
);
serviceWorker.register();