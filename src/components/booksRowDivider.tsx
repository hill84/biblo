import React, { FC } from 'react';
import booksRowImage_jpg from '../images/books-row.png';
import booksRowImage_webp from '../images/books-row.webp';

const BooksRowDivider: FC = () => (
  <div className='pad-v hide-sm books-row-divider'>
    <div className='container-divider' style={{ backgroundImage: `url(${booksRowImage_webp}), url(${booksRowImage_jpg})` }} />
  </div>
);

export default BooksRowDivider;