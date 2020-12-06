import firebase, { firestore, storage } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/performance';
import { prod } from './shared';

type ConfigModel = Record<'appId' | 'apiKey' | 'authDomain' | 'databaseURL' | 'projectId' | 'storageBucket' | 'messagingSenderId', string | undefined>;

const devConfig: ConfigModel = {
  appId: process.env.REACT_APP_FIREBASE_STAGING_APP_ID,
  apiKey: process.env.REACT_APP_FIREBASE_STAGING_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_STAGING_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_STAGING_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_STAGING_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STAGING_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_STAGING_MESSAGING_SENDER_ID
};

const ProdConfig: ConfigModel = {
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
};

const config: ConfigModel = prod ? ProdConfig : devConfig;

if (!firebase.apps.length) firebase.initializeApp(config);

firebase.performance();

/* AUTH */
const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
const FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
const TwitterAuthProvider = new firebase.auth.TwitterAuthProvider();
const auth = firebase.auth();
auth.useDeviceLanguage();
const signOut = (): Promise<void> => auth.signOut();

/* FIRESTORE */
const db: firestore.Firestore = firebase.firestore();
db.settings({/* my settings... */});
const { FieldValue } = firebase.firestore;
const timestamp: firestore.FieldValue = FieldValue.serverTimestamp(); // const timestamp = firebase.ServerValue;

// Admin
const adminRef: firestore.CollectionReference<firestore.DocumentData> = db.collection('admin');
const adminDeletedRef = (collection: string) => adminRef.doc('deleted').collection(collection);
const adminDeletedUserRef = (uid: string) => adminDeletedRef('users').doc(uid);

// Users
const usersRef = db.collection('users');
const userRef = (uid: string) => usersRef.doc(uid);


// Followers
const followersRef = (uid: string) => db.collection('followers').doc(uid);
const followersGroupRef = db.collectionGroup('followers');

// Followings
const followingsRef = (uid: string) => db.collection('followings').doc(uid);

// Shelves
const userShelfRef = (uid: string) => db.collection('shelves').doc(uid);
const userBooksRef = (uid: string) => userShelfRef(uid).collection('books');
const userBookRef = (uid: string, bid: string) => userBooksRef(uid).doc(bid);

// Books
const booksRef = db.collection('books');
const bookRef = (bid: string) => booksRef.doc(bid);
const booksGroupRef = db.collectionGroup('books');

// Collections
const collectionsRef = db.collection('collections');
const collectionRef = (cid: string) => collectionsRef.doc(cid);
const collectionBooksRef = (cid: string) => collectionRef(cid).collection('books');
const collectionFollowersRef = (cid: string) => collectionRef(cid).collection('followers');
const collectionFollowerRef = (cid: string, uid: string) => collectionFollowersRef(cid).doc(uid);
const collectionBookRef = (cid: string, bid: string) => collectionBooksRef(cid).doc(bid);

// Reviews
const reviewsRef = db.collection('reviews');
const reviewRef = (bid: string) => reviewsRef.doc(bid);
const reviewersRef = (bid: string) => reviewRef(bid).collection('reviewers');
const reviewerRef = (bid: string, uid: string) => reviewersRef(bid).doc(uid);
const reviewersGroupRef = db.collectionGroup('reviewers');
const reviewerCommentersRef = (bid: string, uid: string) => reviewerRef(bid, uid).collection('commenters');
const reviewerCommenterRef = (bid: string, uid: string, cid: string) => reviewerCommentersRef(bid, uid).doc(cid);
const commentersGroupRef = db.collectionGroup('commenters');

// Authors
const authorsRef = db.collection('authors');
const authorRef = (aid: string) => authorsRef.doc(aid);
const authorFollowersRef = (aid: string) => authorRef(aid).collection('followers');
const authorFollowerRef = (aid: string, uid: string) => authorFollowersRef(aid).doc(uid);

// Quotes
const quotesRef = db.collection('quotes');
const quoteRef = (qid: string) => quotesRef.doc(qid);

// Notifications
const notificationsRef = db.collection('notifications');
const userNotificationsRef = (uid: string) => notificationsRef.doc(uid);
const notesRef = (uid: string) => userNotificationsRef(uid).collection('notes');
const noteRef = (uid: string, nid: string) => notesRef(uid).doc(nid);
const notesGroupRef = db.collectionGroup('notes');

// Challenges
const challengesRef = db.collection('challenges');
const challengeRef = (cid: string) => challengesRef.doc(cid);
const userChallengesRef = (uid: string) => userRef(uid).collection('challenges');
const userChallengeRef = (uid: string, cid: string) => userChallengesRef(uid).doc(cid);

// Genres
const genreRef = (gid: string) => db.collection('genres').doc(gid);
const genreFollowersRef = (gid: string) => genreRef(gid).collection('followers');
const genreFollowerRef = (gid: string, uid: string) => genreFollowersRef(gid).doc(uid);

// Recommendations
const userRecommendationsRef = (uid: string) => db.collection('recommendations').doc(uid);

// Groups
const groupsRef = db.collection('groups');
const groupRef = (gid: string) => groupsRef.doc(gid);
const groupFollowersRef = (gid: string) => groupRef(gid).collection('followers');
const groupFollowerRef = (gid: string, uid: string) => groupFollowersRef(gid).doc(uid);
const groupDiscussionsRef = (gid: string) => groupRef(gid).collection('discussions');
const groupDiscussionRef = (gid: string, did: string) => groupDiscussionsRef(gid).doc(did);

// Counters
const countRef = (cid: string) => db.collection('counters').doc(cid);

/* STORAGE */
const storageRef: storage.Reference = firebase.storage().ref();

/* EXPORT */
export {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  auth,
  signOut,
  FieldValue,
  timestamp,
  adminDeletedUserRef,
  usersRef,
  userRef,
  userShelfRef,
  userBooksRef,
  userBookRef,
  booksGroupRef,
  booksRef,
  bookRef,
  collectionsRef,
  collectionRef,
  collectionBooksRef,
  collectionFollowersRef,
  collectionFollowerRef,
  collectionBookRef,
  commentersGroupRef,
  followersRef,
  followingsRef,
  followersGroupRef,
  reviewsRef,
  reviewRef,
  reviewersRef,
  reviewerRef,
  reviewerCommentersRef,
  reviewerCommenterRef,
  reviewersGroupRef,
  authorsRef,
  authorRef,
  authorFollowersRef,
  authorFollowerRef,
  quotesRef,
  quoteRef,
  notificationsRef,
  userNotificationsRef,
  notesRef,
  noteRef,
  notesGroupRef,
  challengesRef,
  challengeRef,
  userChallengesRef,
  userChallengeRef,
  genreRef,
  genreFollowersRef,
  genreFollowerRef,
  groupDiscussionsRef,
  groupDiscussionRef,
  userRecommendationsRef,
  groupsRef,
  groupRef,
  groupFollowersRef,
  groupFollowerRef,
  countRef,
  storageRef,
};
export default firebase;