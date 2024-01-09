import type { FC } from 'react';
import '../../css/bookContainer.css';
import Book from '../book';

const BookContainer: FC = () => (
  <div id='bookComponent'>
    <Book />
  </div>
);

export default BookContainer;