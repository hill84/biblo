import React, { forwardRef } from 'react';
import NoMatch from '../noMatch';
import { historyType, locationType } from '../../config/types';

const NoMatchPage = forwardRef((props, ref) => (
  <NoMatch history={props.history} location={props.location} ref={ref} />
));

NoMatchPage.propTypes = {
  history: historyType,
  location: locationType
}

NoMatchPage.defaultProps = {
  history: null,
  location: null
}

export default NoMatchPage;