import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, withRouter } from 'react-router-dom';
import App from './app';
import './css/grid.min.css';
import './css/main.css';
import registerServiceWorker from './registerServiceWorker';

if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
    }
  }
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
	<Router history={createBrowserHistory()}>
		<ScrollToTop>
      <App/>
    </ScrollToTop>
	</Router>,
	document.getElementById('root')
);
registerServiceWorker();