import PropTypes from 'prop-types';
import { noteTypes } from './lists'

const { array, arrayOf, bool, element, func, node, number, object, objectOf, oneOf: _oneOf, oneOfType: _oneOfType, shape, string } = PropTypes; 

export const arrayType = array;
export const arrayOfType = arrayOf;
export const boolType = bool;
export const elementType = element;
export const funcType = func;
export const nodeType = node;
export const numberType = number;
export const objectType = object;
export const objectOfType = objectOf;
export const oneOf = props => _oneOf(props);
export const oneOfType = props => _oneOfType(props);
export const shapeType = props => shape(props);
export const stringType = string;

export const locationType = shape({
  hash: string,
  key: string, // only in createBrowserHistory and createMemoryHistory
  pathname: string.isRequired,
  search: string,
  state: oneOfType([
    array,
    bool,
    number,
    object,
    string,
  ]), // only in createBrowserHistory and createMemoryHistory
});

export const childrenType = oneOfType([
  arrayOf(node),
  node
]);

export const matchType = shape({
  isExact: bool,
  params: object.isRequired,
  path: string.isRequired,
  url: string.isRequired,
});

export const historyType = shape({
  action: oneOf(['PUSH', 'REPLACE', 'POP']).isRequired,
  block: func.isRequired,
  canGo: func, // only in createMemoryHistory
  createHref: func.isRequired,
  entries: arrayOf(locationType), // only in createMemoryHistory
  go: func.isRequired,
  goBack: func.isRequired,
  goForward: func.isRequired,
  index: number, // only in createMemoryHistory
  length: number,
  listen: func.isRequired,
  location: locationType.isRequired,
  push: func.isRequired,
  replace: func.isRequired,
});

export const userType = shape({
  creationTime: number.isRequired,
  privacyAgreement: number.isRequired,
  termsAgreement: number, // not required with socialAuth
  uid: string.isRequired,
  displayName: string.isRequired,
  email: string.isRequired,
  birth_date: string,
  continent: string,
  country: string,
  city: string,
  languages: arrayOf(string),
  photoURL: string.isRequired,
  sex: string,
  roles: shape({
    admin: bool.isRequired,
    editor: bool.isRequired,
    author: bool,
    premium: bool
  }).isRequired,
  stats: shape({
    ratings_num: number.isRequired,
    reviews_num: number.isRequired,
    shelf_num: number.isRequired,
    wishlist_num: number.isRequired
  }).isRequired
});

export const bookType = shape({
  ISBN_10: oneOfType([number, string]),
  ISBN_13: number.isRequired,
  EDIT: shape({
    createdBy: string.isRequired,
    createdByUid: string.isRequired,
    created_num: number.isRequired,
    edit: bool,
    lastEditBy: string,
    lastEditByUid: string,
    lastEdit_num: number
  }).isRequired,
  authors: objectOf(bool.isRequired).isRequired,
  bid: string.isRequired,
  covers: arrayOf(string),
  description: string,
  duration: number, // audio book duration in milliseconds
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
  title_sort: string.isRequired,
  trailerURL: string
});

export const coverType = shape({
  bid: string.isRequired,
  title: string.isRequired,
  subtitle: string,
  authors: shape().isRequired,
  format: string,
  covers: arrayOf(string),
  publisher: string, // required on create
  incipit: string
});

export const flagType = shape({
  value: stringType.isRequired,
  flaggedByUid: stringType.isRequired,
  flagged_num: numberType.isRequired
});

export const reviewType = shape({
  bid: string.isRequired,
  covers: arrayOf(string).isRequired,
  bookTitle: string.isRequired,
  comments_num: number,
  coverURL: arrayOf(string),
  createdByUid: string.isRequired,
  created_num: number.isRequired,
  displayName: string.isRequired,
  lastEdit_num: number,
  lastEditByUid: string,
  flag: flagType,
  likes: arrayOf(string).isRequired,
  photoURL: string,
  rating_num: number.isRequired,
  text: string.isRequired,
  title: string
});

const userBookReviewType = shape({
  bid: string,
  covers: arrayOf(string),
  bookTitle: string,
  coverURL: arrayOf(string),
  createdByUid: string,
  created_num: number,
  displayName: string,
  lastEdit_num: number,
  lastEditByUid: string,
  photoURL: string,
  rating_num: number,
  text: string,
  title: string
});

export const userBookType = shape({
  review: userBookReviewType.isRequired,
  readingState: shape({
    state_num: number.isRequired,
    start_num: number,
    end_num: number
  }).isRequired,
  rating_num: number.isRequired,
  bookInShelf: bool.isRequired,
  bookInWishlist: bool.isRequired 
});

export const ratingsType = shape({
  rating_num: number.isRequired,
  ratings_num: number
});

export const commentType = shape({
  bookTitle: string,
  createdByUid: string.isRequired,
  created_num: number.isRequired,
  displayName: string.isRequired,
  flag: flagType,
  likes: arrayOf(string).isRequired,
  photoURL: string,
  text: string.isRequired
});

export const userReviewType = shape({
  bookTitle: string,
  coverURL: arrayOf(string),
  created_num: number.isRequired,
  reviewerDisplayName: string.isRequired,
  reviewerUid: string.isRequired,
  text: string.isRequired,
  title: string
});

export const authorType = shape({
  bio: string,
  displayName: string.isRequired,
  edit: bool.isRequired,
  // followers: objectOf(bool).isRequired,
  lastEditBy: string.isRequired,
  lastEditByUid: string.isRequired,
  lastEdit_num: number.isRequired,
  photoURL: string,
  sex: string.isRequired,
  source: string
});

export const quoteType = shape({
  author: string.isRequired,
  bid: string,
  bootTitle: string,
  coverURL: string,
  edit: bool.isRequired,
  lastEditBy: string.isRequired,
  lastEditByUid: string.isRequired,
  lastEdit_num: number.isRequired,
  qid: string.isRequired,
  quote: string.isRequired
});

export const challengesType = arrayOf(shape({
  cid: string.isRequired,
  title: string.isRequired,
  books: arrayOf(bool).isRequired
}));

export const challengeType = shape({
  cid: string.isRequired,
  title: string.isRequired,
  description: string,
  books: arrayOf(shape({
    author: string.isRequired,
    bid: string.isRequired,
    cover: string.isRequired,
    title: string.isRequired
  })),
  followers: array
});

export const noteType = shape({
  nid: string.isRequired,
  text: string.isRequired,
  created_num: number.isRequired,
  createdBy: string.isRequired,
  createdByUid: string.isRequired,
  photoURL: string,
  tag: arrayOf(oneOf(noteTypes)), // .isRequired,
  read: bool.isRequired,
  uid: string
});

export const collectionType = shape({
  books_num: number.isRequired,
  description: string.isRequired,
  edit: bool.isRequired,
  genres: arrayOf(string.isRequired).isRequired,
  lastEdit_num: number,
  lastEditBy: string,
  lastEditByUid: string,
  title: string.isRequired
});

export const refType = oneOfType([func, object]);