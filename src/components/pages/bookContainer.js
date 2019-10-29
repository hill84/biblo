import React, { forwardRef } from 'react';
import { funcType, historyType, locationType, matchType, userType } from '../../config/types';
import Book from '../book';

const BookContainer = forwardRef((props, ref) => (
  <div id="BookContainerComponent" ref={ref}>
    <Book 
      bid={props.match.params.bid} 
      user={props.user} 
      openSnackbar={props.openSnackbar} 
      history={props.history} 
      location={props.location} 
    />
  </div>
));

BookContainer.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType,
  openSnackbar: funcType,
  user: userType
}

BookContainer.defaultProps = {
  history: null,
  location: null,
  match: null,
  openSnackbar: null,
  user: null
}

export default BookContainer;