import { createBrowserHistory } from 'history';
import React from 'react';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import App from './app';
import BrowserNotSupported from './components/browserNotSupported';
import './css/grid.min.css';
import './css/main.css';
import * as serviceWorker from './serviceWorker';

const isProd = process.env.NODE_ENV === 'production';

function getInternetExplorerVersion() {
  /* eslint-disable no-var */
  var rv = -1;
  var ua;
  var re;
  /* eslint-enable no-var */
  if (navigator.appName === 'Microsoft Internet Explorer') {
    ua = navigator.userAgent;
    re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(ua) !== null) rv = parseFloat( RegExp.$1 );
  } else if (navigator.appName === 'Netscape') {
    ua = navigator.userAgent;
    re  = new RegExp('Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(ua) !== null) rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

if (isProd) {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
}

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    {getInternetExplorerVersion() === -1 ? <App/> : <BrowserNotSupported />}
  </Router>,
  document.getElementById('root')
);
serviceWorker.register();