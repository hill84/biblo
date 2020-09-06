import React, { useContext } from 'react';
import { historyType, locationType, matchType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/bookContainer.css';
import Book from '../book';

const BookContainer = ({ history, location, match }) => {
  const { isAuth, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <div id="BookContainerComponent">
      <Book 
        bid={match.params.bid}
        user={user}
        openSnackbar={openSnackbar}
        history={history}
        isAuth={isAuth}
        location={location}
      />
    </div>
  );
};

BookContainer.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType
}

BookContainer.defaultProps = {
  history: null,
  location: null,
  match: null
}

export default BookContainer;