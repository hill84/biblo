import PropTypes from 'prop-types';

const { arrayOf, func, shape, number,/*  oneOf, */ string } = PropTypes;

export const funcType = func;

export const stringType = string;

export const userType = shape({
  creationTime: string.isRequired,
  displayName: string.isRequired,
  email: string.isRequired,
  birth_date: string,
  continent: string,
  country: string,
  city: string,
  languages: arrayOf(string),
  photoURL: string,
  sex: string,
  stats: shape({
    //followed_num: number.isRequired,
    followers_num: number.isRequired,
    ratings_num: number.isRequired,
    reviews_num: number.isRequired,
    shelf_num: number.isRequired,
    wishlist_num: number.isRequired
  }).isRequired
});

export const bookType = shape({
  bid: string.isRequired,
  ISBN_num: number.isRequired,
  title: string.isRequired,
  title_sort: string.isRequired,
  subtitle: string,
  authors: string.isRequired, //arrayOf(string).isRequired,
  format: string,
  covers: arrayOf(string),
  pages_num: number.isRequired,
  publisher: string.isRequired,
  publication: string,
  edition: number,
  genres: arrayOf(string),
  languages: arrayOf(string),
  description: string,
  incipit: string,
  ratings: shape({
    ratings_num: number.isRequired,
    totalRating_num: number.isRequired
  }).isRequired
});

export const minimalbookType = shape({
  bid: string.isRequired,
  ISBN_num: number,
  title: string.isRequired,
  title_sort: string,
  subtitle: string,
  authors: string.isRequired, //arrayOf(string).isRequired,
  format: string,
  covers: arrayOf(string),
  pages_num: number,
  publisher: string.isRequired,
  publication: string,
  edition: number,
  genres: arrayOf(string),
  languages: arrayOf(string),
  description: string,
  incipit: string,
  ratings: shape({
    ratings_num: number.isRequired,
    totalRating_num: number.isRequired
  }).isRequired
});

export const userBookType = shape({
  readingState: string.isRequired,
  rating_num: number.isRequired
});

export const ratingsType = shape({
  rating_num: number.isRequired,
  totalRatings_num: number.isRequired
});