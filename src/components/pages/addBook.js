import React, { useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { historyType, locationType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/searchBook.css';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const seo = {
  title: `${app.name} | Aggiungi libro`,
  description: app.desc
};

const AddBook = ({ history, location }) => {
  const { isAuth, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [book, setBook] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const is = useRef(null);

  useEffect(() => () => {
    clearInterval(is.current);
  }, []);

  const onBookSelect = book => setBook(book);

  const onClick = () => {
    is.current = setTimeout(() => {
      setShowNew(true);
    }, 4000);
  };

  return (
    <div className="container" id="addBookComponent" ref={is}>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={app.url} />
      </Helmet>
      
      <div role="button" tabIndex={0} className="card sm flat search-book" onClick={onClick} onKeyDown={onClick}>
        <SearchBookForm onBookSelect={onBookSelect} user={user} />
      </div>

      {book ? (
        <Book
          bid={book.bid}
          book={book}
          history={history}
          location={location}
          isAuth={isAuth}
          user={user}
          openSnackbar={openSnackbar}
        />
      ) : (
        <>
          <p className="text-center">
            <Link to="/genres" className="counter">Generi</Link>
            <Link to="/collections" className="counter">Collezioni</Link>
            <Link to="/authors" className="counter">Autori</Link>
          </p>
          {showNew && (
            <div className="text-center pad-v fadeIn reveal">
              <p>Non hai trovato il libro che cercavi?</p>
              <p><Link to="/new-book" className="btn primary rounded">Aggiungilo</Link></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

AddBook.propTypes = {
  history: historyType,
  location: locationType
}

AddBook.defaultProps = {
  history: null,
  location: null
}
 
export default AddBook;