import React, { forwardRef, useContext } from 'react';
import { funcType, historyType, locationType, matchType } from '../../config/types';
import UserContext from '../../context/userContext';
import '../../css/bookContainer.css';
import Book from '../book';

const BookContainer = forwardRef((props, ref) => {
  const { user } = useContext(UserContext);
  const { history, location, match, openSnackbar } = props;

  return (
    <div id="BookContainerComponent" ref={ref}>
      <Book 
        bid={match.params.bid}
        user={user}
        openSnackbar={openSnackbar}
        history={history}
        location={location}
      />
    </div>
  );
});

BookContainer.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType,
  openSnackbar: funcType
}

BookContainer.defaultProps = {
  history: null,
  location: null,
  match: null,
  openSnackbar: null
}

export default BookContainer;