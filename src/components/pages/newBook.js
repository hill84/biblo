import { ThemeProvider } from '@material-ui/styles';
import React, { useState } from 'react';
import icon from '../../config/icons';
import { darkTheme } from '../../config/themes';
import { funcType, historyType, locationType, userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const NewBook = props => {
  const [book, setBook] = useState(null);

  const onBookSelect = book => setBook(book);

	const { history, location, openSnackbar, user } = props;

  return (
    <div className="container" id="newBookComponent">
      {!book && <h2 className="text-center">{icon.plus()} Crea la tua scheda libro</h2>}
      <ThemeProvider theme={darkTheme}>
        <div className="card sm dark search-book">
          <SearchBookForm onBookSelect={onBookSelect} user={user} newBook />
        </div>
      </ThemeProvider>
      {book ? <Book book={book} user={user} history={history} location={location} openSnackbar={openSnackbar} isEditing />
      : <p className="text-sm lighter-text text-center">Powered by <a href="https://books.google.com/">Google Books</a></p>}
    </div>
  );
}

NewBook.propTypes = {
  history: historyType,
  location: locationType,
  openSnackbar: funcType,
  user: userType
}

NewBook.defaultProps = {
  history: null,
  location: null,
  openSnackbar: null,
  user: null
}

export default NewBook;