import React from 'react';
import Book from '../book';

const BookContainer = props => (
    <div id="BookContainerComponent">
      <Book bid={props.match.params.bid} user={props.user} openSnackbar={props.openSnackbar} history={props.history} location={props.location} />
    </div>
  );

export default BookContainer;