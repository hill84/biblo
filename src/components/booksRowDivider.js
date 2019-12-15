import React from 'react';
import booksRowImage from '../images/books-row.png';

const booksRowStyle = { backgroundImage: `url(${booksRowImage})` };

const BooksRowDivider = () => (
  <div className="pad-v hide-sm books-row-divider">
    <div className="container-divider" style={booksRowStyle} />
  </div>
);

export default BooksRowDivider;