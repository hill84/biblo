import React, { FC, Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, RouteComponentProps } from 'react-router-dom';
import { app } from '../../config/shared';
import '../../css/searchBook.css';
import { BookModel } from '../../types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const seo = {
  title: `${app.name} | Aggiungi libro`,
  description: app.desc
};

type AddBookProps = RouteComponentProps;

let timeout: number;

const AddBook: FC<AddBookProps> = ({ history, location }: AddBookProps) => {
  const [book, setBook] = useState<BookModel | null>(null);
  const [showNew, setShowNew] = useState<boolean>(false);

  useEffect(() => () => {
    clearInterval(timeout);
  }, []);

  const onBookSelect = (book: BookModel): void => setBook(book);

  const onClick = (): void => {
    timeout = window.setTimeout((): void => {
      setShowNew(true);
    }, 4000);
  };

  return (
    <div className='container' id='addBookComponent'>
      <Helmet>
        <title>{seo.title}</title>
        <meta name='description' content={seo.description} />
        <link rel='canonical' href={app.url} />
      </Helmet>
      
      <div role='button' tabIndex={0} className='card sm flat search-book' onClick={onClick} onKeyDown={onClick}>
        <SearchBookForm onBookSelect={onBookSelect} />
      </div>

      {book ? (
        <Book
          bid={book.bid}
          book={book}
          history={history}
          location={location}
        />
      ) : (
        <Fragment>
          <p className='text-center'>
            <Link to='/genres' className='counter'>Generi</Link>
            <Link to='/collections' className='counter'>Collezioni</Link>
            <Link to='/authors' className='counter'>Autori</Link>
          </p>
          {showNew && (
            <div className='text-center pad-v fadeIn reveal'>
              <p>Non hai trovato il libro che cercavi?</p>
              <p><Link to='/new-book' className='btn primary rounded'>Aggiungilo</Link></p>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};
 
export default AddBook;