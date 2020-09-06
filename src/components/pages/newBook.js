import React, { useContext, useState } from 'react';
import { historyType, locationType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const NewBook = ({ history, location }) => {
  const { isAuth, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [book, setBook] = useState(null);
  
  const onBookSelect = book => setBook(book);

  return (
    <div className="container" id="newBookComponent">
      
      <div className="card sm flat search-book">
        <SearchBookForm onBookSelect={onBookSelect} user={user} newBook />
      </div>

      {book ? (
        <Book
          book={book}
          user={user}
          isAuth={isAuth}
          history={history}
          location={location}
          openSnackbar={openSnackbar}
          isEditing
        />
      ) : ( 
        <p className="text-sm lighter-text text-center">Powered by <a href="https://books.google.com/">Google Books</a></p>
      )}
    </div>
  );
}

NewBook.propTypes = {
  history: historyType,
  location: locationType
}

NewBook.defaultProps = {
  history: null,
  location: null
}

export default NewBook;