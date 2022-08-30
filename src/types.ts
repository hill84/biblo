import { ReactNode } from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';

export interface UserModel {
  creationTime: number;
  privacyAgreement?: number;
  termsAgreement?: number;
  uid: string;
  displayName: string;
  email: string;
  birth_date: string;
  continent: string;
  country: string;
  city: string;
  languages: string[];
  photoURL: string;
  sex: string;
  roles: RolesModel;
  stats: StatsModel;
  website?: string;
  youtube?: string;
  instagram?: string;
  twitch?: string;
  facebook?: string;
}

export interface FollowerModel {
  displayName: string;
  gid?: string;
  photoURL: string;
  timestamp: number;
  uid?: string;
}

export interface FollowingModel {
  displayName: string;
  photoURL: string;
  timestamp: number;
}

export interface BookEDITModel {
  createdBy: string;
  createdByUid: string;
  created_num: number;
  edit: boolean;
  lastEditBy: string;
  lastEditByUid: string;
  lastEdit_num: number;
}

export interface BookModel {
  ISBN_10: number | string;
  ISBN_13: number;
  EDIT: BookEDITModel;
  authors: Record<string, boolean>;
  awards?: string[];
  bcid?: number;
  bid: string;
  collections?: string[];
  covers: string[];
  description: string;
  duration?: number; // audio book duration in milliseconds
  edition_num: number;
  format: ItalianFormatType;
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

export interface CoverModel extends Pick<BookModel, 'authors' | 'bid' | 'covers' | 'title'> {
  awards?: string[];
  bcid?: number;
  format?: FormatType;
  incipit?: string;
  publisher?: string;
  rating_num?: number;
  ratings_num?: number;
  readingState?: ReadingStateModel;
  readers_num?: number;
  review?: UserBookReviewModel;
  subtitle?: string;
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

export interface UserBookReviewModel {
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

export interface ReadingStateModel {
  progress_num?: number;
  end_num?: number;
  state_num: number;
  start_num?: number;
}

export interface UserBookModel extends Pick<BookModel, 'authors' | 'bid' | 'covers' | 'publisher' | 'subtitle' | 'title'>{
  added_num: number;
  bookInShelf: boolean;
  bookInWishlist: boolean;
  genres?: string[];
  pages_num?: number;
  rating_num: number;
  readingState: ReadingStateModel;
  review: Partial<UserBookReviewModel>;
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
  bookTitle: string;
  coverURL: string;
  edit: boolean;
  lastEditBy: string;
  lastEditByUid: string;
  lastEdit_num: number;
  qid: string;
  quote: string;
}

export interface ChallengeBookModel {
  author: string;
  bid: string;
  cover: string;
  title: string;
}

export interface ChallengesModel {
  books: ChallengeBookModel[];
  cid: string;
  description: string;
  title: string;
}[];

export interface ChallengeModel {
  cid: string;
  title: string;
  description: string;
  books: Record<string, ChallengeBookModel>;
  // followers?: any;
}

export interface UserChallengeModel {
  books: Record<string, boolean>;
  cid: string;
  completed_num: number;
  created_num: number;
  title: string;
}

export interface NoteModel {
  nid: string;
  text: string;
  created_num: number;
  createdBy?: string;
  createdByUid?: string;
  photoURL?: string;
  tag?: string[];
  read: boolean;
  role?: RolesType;
  uid?: string;
}

export interface CollectionModel {
  books_num: number;
  description: string;
  edit: boolean;
  genres: string[];
  lastEdit_num: number;
  lastEditBy: string;
  lastEditByUid: string;
  title: string;
}

export interface CollectionBookModel extends Pick<BookModel, 'authors' | 'bid' | 'covers' | 'publication' | 'publisher' | 'rating_num' | 'ratings_num' | 'subtitle' | 'title'> {
  bcid: number;
}

export interface ModeratorModel {
  displayName: string;
  photoURL: string;
  timestamp: number;
  uid: string;
}

export interface GroupModel {
  created_num: number;
  description: string;
  edit: boolean;
  followers_num: number;
  gid: string;
  lastEdit_num: number;
  lastEditBy: string;
  lastEditByUid: string;
  location: string;
  moderators: string[];
  owner: string;
  ownerUid: string;
  photoURL: string;
  rules: string;
  title: string;
  type: 'private' | 'public';
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
  logo: string;
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

export interface RecommendModel {
  bid: string;
  cover: string;
  title: string;
  uid: string;
}

export interface RecommendationModel {
  amount: number;
  displayName?: string;
  photoURL?: string;
  recommends: RecommendModel[];
  timestamp: number;
  uid?: string;
}

export interface RolesModel {
  admin: boolean;
  author?: boolean;
  editor: boolean;
  premium: boolean;
}

export interface OrderByModel {
  type: string;
  label: string;
  icon?: ReactNode;
}

export interface SearchByModel {
  key: string;
  type: string;
  label: string;
  hint: string;
  where: string;
}

export interface CurrentTarget {
  dataset?: Record<string, string>;
  parentNode?: ParentNodeWithDataset;
}

export interface ParentNodeWithDataset extends ParentNode {
  dataset?: Record<string, string>;
}

export type EventTargetElement = EventTarget & Element;

export type FollowersModel = Record<string, FollowerModel>;

export type FollowingsModel = Record<string, FollowingModel>;

export type HistoryType = RouteComponentProps['history'];

export type LocationType = RouteProps['location']; // ALSO: path, exact, strict, component, render, children, sensitive

export type StatsModel = Record<StatsType, number>;

export type RolesType = 'admin' | 'author' | 'editor' | 'premium';

export type StatsType = 'ratings_num' | 'reviews_num' | 'shelf_num' | 'wishlist_num';

export type FormatType = 'audio' | 'magazine' | 'ebook' | 'book';

export type ItalianFormatType = 'Libro' | 'Rivista' | 'Ebook' | 'Audiolibro';

export type RefType = Function | object;

export type ScreenSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type BooksPerRowType = 3 | 2 | 4 | 6 | 7;

export type BookshelfType = 'shelf' | 'wishlist';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsCurrent = any;