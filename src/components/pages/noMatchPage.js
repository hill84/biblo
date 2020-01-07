import React from 'react';
import NoMatch from '../noMatch';
import { historyType, locationType } from '../../config/types';

const NoMatchPage = props => (
  <NoMatch history={props.history} location={props.location} />
);

NoMatchPage.propTypes = {
  history: historyType,
  location: locationType
}

NoMatchPage.defaultProps = {
  history: null,
  location: null
}

export default NoMatchPage;