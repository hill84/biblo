import { ThemeProvider } from '@material-ui/styles';
import React, { useContext, useState } from 'react';
import icon from '../../config/icons';
import { darkTheme } from '../../config/themes';
import { historyType, locationType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const NewBook = props => {
  const { isAuth, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
	const { history, location } = props;
  const [book, setBook] = useState(null);
  
  const onBookSelect = book => setBook(book);

  return (
    <div className="container" id="newBookComponent">
      {!book && <h2 className="text-center">{icon.plus} Crea la tua scheda libro</h2>}
      <ThemeProvider theme={darkTheme}>
        <div className="card sm dark search-book">
          <SearchBookForm onBookSelect={onBookSelect} user={user} newBook />
        </div>
      </ThemeProvider>
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