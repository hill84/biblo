import React from 'react';
import Book from '../book';
import queryString from 'query-string';

const BookContainer = props => {
  const search = queryString.parse(props.location.search);
  return (
    <div id="BookContainerComponent">
      <Book bid={props.match.params.bid} isEditing={search.edit} user={props.user} openSnackbar={props.openSnackbar} />
    </div>
  );
};

export default BookContainer;