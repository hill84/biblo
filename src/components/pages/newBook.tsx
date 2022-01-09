import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { BookModel } from '../../types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const NewBook: FC<RouteComponentProps> = ({ history, location }: RouteComponentProps) => {
  const [book, setBook] = useState<BookModel | null>(null);
  
  const onBookSelect = (book: BookModel): void => setBook(book);

  return (
    <div className='container' id='newBookComponent'>
      <div className='card sm flat search-book'>
        <SearchBookForm
          onBookSelect={onBookSelect}
          newBook
        />
      </div>

      {book ? (
        <Book
          book={book}
          history={history}
          location={location}
          isEditing
        />
      ) : ( 
        <p className='text-sm lighter-text text-center'>Powered by <a href='https://books.google.com/'>Google Books</a></p>
      )}
    </div>
  );
};

export default NewBook;