import React from 'react';
import booksRowImage_jpg from '../images/books-row.png';
import booksRowImage_webp from '../images/books-row.webp';

const booksRowStyle = { backgroundImage: `url(${booksRowImage_webp}), url(${booksRowImage_jpg})`, };

const BooksRowDivider = () => (
  <div className="pad-v hide-sm books-row-divider">
    <div className="container-divider" style={booksRowStyle} />
  </div>
);

export default BooksRowDivider;