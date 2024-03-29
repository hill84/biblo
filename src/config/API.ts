import type { SearchParamsModel } from '../booksAPITypes';

const booksAPIKey: string | undefined = process.env.REACT_APP_BOOKS_API_KEY;
const booksAPI = 'https://www.googleapis.com/books/v1/';

export const booksAPIRef = ({
  q,
  intitle,
  inauthor,
  inpublisher,
  isbn,
  maxResults = 30,
  startIndex,
}: SearchParamsModel): string => {
  return `${booksAPI}volumes?q=${q}${intitle ? `+intitle:${intitle}` : ''}${inauthor ? `+inauthor:${inauthor}` : ''}${inpublisher ? `+inpublisher:${inpublisher}` : ''}${isbn ? `+isbn:${isbn}` : ''}&langRestrict=it&printType=books&key=${booksAPIKey}&maxResults=${maxResults}${startIndex ? `&startIndex=${startIndex}` : ''}`;
};

// EXAMPLE: booksAPIRef({ q: 'red', intitle: 'sherlock' });