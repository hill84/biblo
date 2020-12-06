export interface LocationModel {
  hash: string;
  key?: string;
  pathname: string;
  search: string;
  state?: unknown[];
}

export interface MatchModel {
  isExact: boolean;
  params: unknown;
  path: string;
  url: string;
}

export interface HistoryModel {
  action: Array<'PUSH' | 'REPLACE' | 'POP'>;
  block: Function;
  canGo?: Function;
  createHref: Function;
  entries?: LocationModel[];
  go: Function;
  goBack: Function;
  goForward: Function;
  index?: number;
  length: number;
  listen: Function;
  location: LocationModel;
  push: Function;
  replace: Function;
}

export interface UserModel {
  creationTime: number;
  privacyAgreement?: number;
  termsAgreement?: number;
  uid: string;
  displayName: string;
  email: string;
  birth_date: number;
  continent: string;
  country: string;
  city: string;
  languages: string[];
  photoURL: string;
  sex: string;
  roles: RolesModel;
  stats: StatsModel;
}

export interface BookModel {
  ISBN_10: number | string;
  ISBN_13: number;
  EDIT: {
    createdBy: string;
    createdByUid: string;
    created_num: number;
    edit: boolean;
    lastEditBy: string;
    lastEditByUid: string;
    lastEdit_num: number;
  };
  authors: Record<string, boolean>;
  bid: string;
  covers: string[];
  description: string;
  duration: number; // audio book duration in milliseconds
  edition_num: number;
  format: FormatType;
  genres: string[];
  incipit: string;
  languages: string[];
  pages_num: number;
  publisher: string;
  publication: string;
  readers_num: number;
  reviews_num: number;
  ratings_num: number;
  rating_num: number;
  subtitle: string;
  title: string;
  title_sort: string;
  trailerURL: string;
}

export interface CoverModel {
  bid: string;
  title: string;
  subtitle: string;
  authors: unknown;
  format: FormatType;
  covers: string[];
  publisher: string;
  incipit: string;
}

export interface FlagModel {
  value: string;
  flaggedByUid: string;
  flagged_num: number;
}

export interface ReviewModel {
  bid: string;
  covers: string[];
  bookTitle: string;
  comments_num: number;
  coverURL: string[];
  createdByUid: string;
  created_num: number;
  displayName: string;
  lastEdit_num: number;
  lastEditByUid: string;
  flag: FlagModel;
  likes: string[];
  photoURL: string;
  rating_num: number;
  text: string;
  title: string;
}

interface UserBookReviewModel {
  bid: string;
  covers: string[];
  bookTitle: string;
  coverURL: string[];
  createdByUid: string;
  created_num: number;
  displayName: string;
  lastEdit_num: number;
  lastEditByUid: string;
  photoURL: string;
  rating_num: number;
  text: string;
  title: string;
}

export interface UserBookModel {
  review: UserBookReviewModel;
  readingState: {
    state_num: number;
    start_num: number;
    end_num: number;
  };
  rating_num: number;
  bookInShelf: boolean;
  bookInWishlist: boolean;
}

export interface RatingsModel {
  rating_num: number;
  ratings_num: number;
}

export interface CommentModel {
  bookTitle: string;
  createdByUid: string;
  created_num: number;
  displayName: string;
  flag: FlagModel;
  likes: string[];
  photoURL: string;
  text: string;
}

export interface UserReviewModel {
  bookTitle: string;
  coverURL: string[];
  created_num: number;
  reviewerDisplayName: string;
  reviewerUid: string;
  text: string;
  title: string;
}

export interface AuthorModel {
  bio: string;
  displayName: string;
  edit: boolean;
  // followers: objectOf(boolean);
  lastEditBy: string;
  lastEditByUid: string;
  lastEdit_num: number;
  photoURL: string;
  sex: string;
  source: string;
}

export interface QuoteModel {
  author: string;
  bid: string;
  bootTitle: string;
  coverURL: string;
  edit: boolean;
  lastEditBy: string;
  lastEditByUid: string;
  lastEdit_num: number;
  qid: string;
  quote: string;
}

export interface ChallengesModel {
  cid: string;
  title: string;
  books: boolean[];
}[];

/* export interface ChallengeModel {
  cid: string;
  title: string;
  description: string;
  books: {
    author: string;
    bid: string;
    cover: string;
    title: string
  }[];
  followers: Array<any> ?
} */

export interface NoteModel {
  nid?: string;
  text: string;
  created_num: number;
  createdBy?: string;
  createdByUid?: string;
  photoURL?: string;
  tag?: string[];
  read: boolean;
  uid?: string;
}

/* export interface CollectionModel {
  books_num: number;
  description: string;
  edit: boolean;
  genres: arrayOf(string);
  lastEdit_num: number;
  lastEditBy: string;
  lastEditByUid: string;
  title: string
} */

export interface ModeratorModel {
  uid: string;
  displayName: string;
  photoURL: string;
  timestamp: number;
}

export interface GroupModel {
  gid: string;
  title: string;
  description: string;
  rules: string;
  photoURL: string;
  followers_num: number;
  type: 'private' | 'public';
  location: string;
  created_num: number;
  owner: string;
  ownerUid: string;
  lastEdit_num: number;
  lastEditBy: string;
  lastEditByUid: string;
  moderators: ModeratorModel[];
}

export interface DiscussionModel {
  did: string;
  createdByUid: string;
  created_num: number;
  displayName: string;
  lastEdit_num: number;
  lastEditByUid: string;
  flag: FlagModel;
  photoURL: string;
  text: string;
}

export interface AppModel {
  name: string;
  url: string;
  logo: unknown;
  fb: { name: string; url: string };
  tw: { name: string; url: string };
  help: {
    group: { url: string };
  };
  email: string;
  privacyEmail: string;
  desc: string;
}

export interface UserContextModel {
  emailVerified: boolean;
  error?: string;
  isAuth: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
  isEditor: boolean;
  isPremium: boolean;
  user?: UserModel;
}

export interface RolesModel {
  'admin': boolean;
  'author'?: boolean;
  'editor': boolean;
  'premium': boolean;
}

export type StatsModel = Record<StatsType, number>;

export type RolesType = 'admin' | 'author' | 'editor' | 'premium';

export type StatsType = 'ratings_num' | 'reviews_num' | 'shelf_num' | 'wishlist_num';

export type FormatType = 'audio' | 'magazine' | 'ebook' | 'book';

export type RefType = Function | object;

export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type BooksPerRowType = 3 | 2 | 4 | 6 | 7;