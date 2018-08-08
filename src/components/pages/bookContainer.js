import React from 'react';
import Book from '../book';

const BookContainer = props => {
  return (
    <div id="BookContainerComponent">
      <Book bid={props.match.params.bid} user={props.user} openSnackbar={props.openSnackbar} />
    </div>
  );
};

export default BookContainer;