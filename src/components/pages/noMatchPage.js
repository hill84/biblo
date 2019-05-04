import React from 'react';
import NoMatch from '../noMatch';

const NoMatchPage = React.forwardRef((props, ref) => (
  <NoMatch history={props.history} location={props.location} ref={ref} />
));

export default NoMatchPage;