import PropTypes from 'prop-types';

const { array, arrayOf, bool, func, shape, number, object, objectOf, oneOf, oneOfType, string } = PropTypes;

export const arrayType = array;
export const arrayOfType = arrayOf;
export const funcType = func;
export const stringType = string;
export const boolType = bool;
export const numberType = number;
export const objectType = object;
export const objectOfType = objectOf;
export const shapeType = props => shape(props);
export const _oneOf = props => oneOf(props);
export const _oneOfType = props => oneOfType(props);

export const locationType = PropTypes.shape({
  hash: PropTypes.string,
  key: PropTypes.string, // only in createBrowserHistory and createMemoryHistory
  pathname: PropTypes.string.isRequired,
  search: PropTypes.string,
  state: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.object,
    PropTypes.string,
  ]), // only in createBrowserHistory and createMemoryHistory
});

export const childrenType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node
]);

export const matchType = PropTypes.shape({
  isExact: PropTypes.bool,
  params: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});

export const historyType = PropTypes.shape({
  action: PropTypes.oneOf(['PUSH', 'REPLACE', 'POP']).isRequired,
  block: PropTypes.func.isRequired,
  canGo: PropTypes.func, // only in createMemoryHistory
  createHref: PropTypes.func.isRequired,
  entries: PropTypes.arrayOf(locationType), // only in createMemoryHistory
  go: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  goForward: PropTypes.func.isRequired,
  index: PropTypes.number, // only in createMemoryHistory
  length: PropTypes.number,
  listen: PropTypes.func.isRequired,
  location: locationType.isRequired,
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
});

export const userType = shape({
  creationTime: number.isRequired,
  privacyAgreement: number.isRequired,
  termsAgreement: number.isRequired,
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

export const userBookType = shape({
  review: shape({
    created_num: number,
    text: string,
    title: string
  }).isRequired,
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

export const reviewType = shape({
  bookTitle: string,
  coverURL: arrayOf(string),
  createdByUid: string.isRequired,
  created_num: number.isRequired,
  displayName: string.isRequired,
  flag: shape({
    value: stringType.isRequired,
    flaggedByUid: stringType.isRequired,
    flagged_num: numberType.isRequired
  }),
  likes: arrayOf(string).isRequired,
  photoURL: string,
  rating_num: number.isRequired,
  text: string.isRequired,
  title: string
});

export const userReviewType = shape({
  bookTitle: string,
  coverURL: arrayOf(string),
  created_num: number.isRequired,
  likes_num: number.isRequired,
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
  tag: arrayOf(_oneOf(['welcome', 'follow', 'like', 'test'])), // .isRequired,
  read: bool.isRequired,
  uid: string
});

export const refType = PropTypes.oneOfType([PropTypes.func, PropTypes.object]);