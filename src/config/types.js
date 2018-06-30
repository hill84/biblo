import PropTypes from 'prop-types';

const { arrayOf, bool, func, shape, number, object, /* oneOf, */ oneOfType, string } = PropTypes;

export const funcType = func;
export const stringType = string;
export const boolType = bool;
export const numberType = number;
export const objectType = object;
export const shapeType = props => shape(props);
// export const oneOfType = props => oneOf(props);
export const _oneOfType = props => oneOfType(props);

export const userType = shape({
  creationTime: string.isRequired,
  uid: string.isRequired,
  displayName: string.isRequired,
  email: string.isRequired,
  birth_date: string,
  continent: string,
  country: string,
  city: string,
  languages: arrayOf(string),
  photoURL: string,
  sex: string,
  roles: shape({
    admin: bool.isRequired,
    editor: bool.isRequired,
    premium: bool
  }).isRequired,
  stats: shape({
    followed: arrayOf(string),
    followed_num: number.isRequired,
    followers: arrayOf(string),
    followers_num: number.isRequired,
    ratings_num: number.isRequired,
    reviews_num: number.isRequired,
    shelf_num: number.isRequired,
    wishlist_num: number.isRequired
  }).isRequired
});

export const bookType = shape({
  ISBN_10: number,
  ISBN_13: number.isRequired,
  EDIT: shape({
    createdBy: string.isRequired,
    createdByUid: string.isRequired,
    created_num: number.isRequired,
    edit: bool.isRequired,
    lastEditBy: string.isRequired,
    lastEditByUid: string.isRequired,
    lastEdit_num: number.isRequired
  }),
  authors: arrayOf(string).isRequired,
  bid: string.isRequired,
  covers: arrayOf(string),
  description: string,
  edition_num: number,
  format: string,
  genres: arrayOf(string),
  incipit: string,
  languages: arrayOf(string),
  pages_num: number.isRequired,
  publisher: string.isRequired,
  publication: string,
  readers_num: number.isRequired,
  reviews_num: number.isRequired,
  ratings_num: number.isRequired,
  rating_num: number.isRequired,
  subtitle: string,
  title: string.isRequired,
  title_sort: string.isRequired
});

export const coverType = shape({
  bid: string.isRequired,
  title: string.isRequired,
  subtitle: string,
  authors: arrayOf(string).isRequired,
  format: string,
  covers: arrayOf(string),
  publisher: string.isRequired,
  incipit: string
});

export const userBookType = shape({
  review: shape({
    created_num: numberType,
    text: stringType,
    title: stringType
  }).isRequired,
  readingState: shape({
    state_num: numberType.isRequired,
    start_num: numberType,
    end_num: numberType
  }).isRequired,
  rating_num: number.isRequired,
  bookInShelf: bool.isRequired,
  bookInWishlist: bool.isRequired 
});

export const ratingsType = shape({
  rating_num: number.isRequired,
  ratings_num: number
});

export const reviewType = shape({
  photoURL: stringType,
  displayName: stringType.isRequired,
  createdByUid: stringType.isRequired,
  created_num: numberType.isRequired,
  likes: arrayOf(string).isRequired,
  rating_num: numberType.isRequired,
  text: stringType.isRequired,
  title: stringType
});

export const userReviewType = shape({
  created_num: numberType.isRequired,
  likes_num: numberType.isRequired,
  text: stringType.isRequired,
  title: stringType
});

export const authorType = shape({ //TODO
  aid: string.isRequired,
  bio: stringType,
  created_num: numberType.isRequired,
  languages: arrayOf(string),
  followers: arrayOf(string),
  followers_num: numberType.isRequired,
  name: stringType.isRequired,
  name_sort: stringType.isRequired,
  photoURL: string,
  sex: string.isRequired
});