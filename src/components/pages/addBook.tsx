import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import '../../css/searchBook.css';
import type { BookModel } from '../../types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

type AddBookProps = RouteComponentProps;

let timeout: number;

const AddBook: FC<AddBookProps> = ({ history, location }: AddBookProps) => {
  const [book, setBook] = useState<BookModel | null>(null);
  const [showNew, setShowNew] = useState<boolean>(false);

  const { t } = useTranslation(['common']);

  const seo = {
    title: `${app.name} | ${t('PAGE_ADD_BOOK')}`,
    description: app.desc
  };

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
        <>
          <p className='text-center'>
            <Link to='/genres' className='counter'>{t('PAGE_GENRES')}</Link>
            <Link to='/collections' className='counter'>{t('PAGE_COLLECTIONS')}</Link>
            <Link to='/authors' className='counter'>{t('PAGE_AUTHORS')}</Link>
          </p>
          {showNew && (
            <div className='text-center pad-v fadeIn reveal'>
              <p>{t('BOOK_NOT_FOUND_QUESTION')}</p>
              <p>
                <Link to='/new-book' className='btn primary rounded'>
                  {t('ACTION_ADD_IT')}
                </Link>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
 
export default AddBook;