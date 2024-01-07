import type { FC } from 'react';
import '../../css/bookContainer.css';
import Book from '../book';

const BookContainer: FC = () => {
  console.log('BOOK CONTAINER');
  return (
    <div id='bookComponent'>
      <Book />
    </div>
  );
};

export default BookContainer;