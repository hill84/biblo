import { ThemeProvider } from '@material-ui/styles';
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import icon from '../../config/icons';
import { app } from '../../config/shared';
import { primaryTheme } from '../../config/themes';
import { funcType, historyType, locationType } from '../../config/types';
import UserContext from '../../context/userContext';
import '../../css/searchBook.css';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const seo = {
  title: `${app.name} | Aggiungi libro`,
  description: app.desc
};

const AddBook = props => {
  const { user } = useContext(UserContext);
  const { history, location, openSnackbar } = props;
  const [book, setBook] = useState(null);

  const onBookSelect = book => setBook(book);

  return (
    <div className="container" id="addBookComponent">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={app.url} />
      </Helmet>
      {!book && <h2 className="text-center">{icon.magnify()} Cerca un libro</h2>}
      <ThemeProvider theme={primaryTheme}>
        <div className="card sm primary search-book">
          <SearchBookForm onBookSelect={onBookSelect} user={user} />
        </div>
      </ThemeProvider>
      {book ?
        <Book bid={book.bid} book={book} history={history} location={location} user={user} openSnackbar={openSnackbar} />
      :
        <>
          <p className="text-center">
            <Link to="/genres" className="counter">Generi</Link>
            <Link to="/collections" className="counter">Collezioni</Link>
            <Link to="/authors" className="counter">Autori</Link>
          </p>
          <div className="text-center pad-v fadeIn reveal delay20">
            <p>Non hai trovato il libro che cercavi?</p>
            <p><Link to="/new-book" className="btn primary rounded">Crea la tua scheda libro</Link></p>
          </div>
        </>
      }
    </div>
  );
}

AddBook.propTypes = {
  history: historyType,
  location: locationType,
  openSnackbar: funcType
}

AddBook.defaultProps = {
  history: null,
  location: null,
  openSnackbar: null
}
 
export default AddBook;