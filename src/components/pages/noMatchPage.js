import React from 'react';
import NoMatch from '../noMatch';

const NoMatchPage = props => (
  <NoMatch history={props.history} location={props.location} />
);

export default NoMatchPage;