import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/performance';
import { prod } from './shared';

const devConfig = {
  appId: process.env.REACT_APP_FIREBASE_STAGING_APP_ID,
  apiKey: process.env.REACT_APP_FIREBASE_STAGING_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_STAGING_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_STAGING_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_STAGING_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STAGING_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_STAGING_MESSAGING_SENDER_ID
};

const ProdConfig = {
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
};

const config = prod ? ProdConfig : devConfig;

if (!firebase.apps.length) firebase.initializeApp(config);

firebase.performance();

/* AUTH */
const GoogleAuthProvider = firebase.auth && new firebase.auth.GoogleAuthProvider();
const FacebookAuthProvider = firebase.auth && new firebase.auth.FacebookAuthProvider();
const TwitterAuthProvider = firebase.auth && new firebase.auth.TwitterAuthProvider();
const auth = firebase.auth();
auth.useDeviceLanguage();
const signOut = () => auth.signOut();

/* FIRESTORE */
const db = firebase.firestore();
db.settings({/* my settings... */});
const { FieldValue } = firebase.firestore;
const timestamp = FieldValue.serverTimestamp(); // const timestamp = firebase.ServerValue;

// Admin
const adminRef = db.collection('admin');
const adminDeletedRef = collection => adminRef.doc('deleted').collection(collection);
const adminDeletedUserRef = uid => adminDeletedRef('users').doc(uid);

// Users
const usersRef = db.collection('users');
const userRef = uid => usersRef.doc(uid);


// Followers
const followersRef = uid => db.collection('followers').doc(uid);
const followersGroupRef = db.collectionGroup('followers');

// Followings
const followingsRef = uid => db.collection('followings').doc(uid);

// Shelves
const userShelfRef = uid => db.collection('shelves').doc(uid);
const userBooksRef = uid => userShelfRef(uid).collection('books');
const userBookRef = (uid, bid) => userBooksRef(uid).doc(bid);

// Books
const booksRef = db.collection('books');
const bookRef = bid => booksRef.doc(bid);
const booksGroupRef = db.collectionGroup('books');

// Collections
const collectionsRef = db.collection('collections');
const collectionRef = cid => collectionsRef.doc(cid);
const collectionBooksRef = cid => collectionRef(cid).collection('books');
const collectionFollowersRef = cid => collectionRef(cid).collection('followers');
const collectionFollowerRef = (cid, uid) => collectionFollowersRef(cid).doc(uid);
const collectionBookRef = (cid, bid) => collectionBooksRef(cid).doc(bid);

// Reviews
const reviewsRef = db.collection('reviews');
const reviewRef = bid => reviewsRef.doc(bid);
const reviewersRef = bid => reviewRef(bid).collection('reviewers');
const reviewerRef = (bid, uid) => reviewersRef(bid).doc(uid);
const reviewersGroupRef = db.collectionGroup('reviewers');
const reviewerCommentersRef = (bid, uid) => reviewerRef(bid, uid).collection('commenters');
const reviewerCommenterRef = (bid, uid, cid) => reviewerCommentersRef(bid, uid).doc(cid);
const commentersGroupRef = db.collectionGroup('commenters');

// Authors
const authorsRef = db.collection('authors');
const authorRef = aid => authorsRef.doc(aid);
const authorFollowersRef = aid => authorRef(aid).collection('followers');
const authorFollowerRef = (aid, uid) => authorFollowersRef(aid).doc(uid);

// Quotes
const quotesRef = db.collection('quotes');
const quoteRef = qid => quotesRef.doc(qid);

// Notifications
const notificationsRef = db.collection('notifications');
const userNotificationsRef = uid => notificationsRef.doc(uid);
const notesRef = uid => userNotificationsRef(uid).collection('notes');
const noteRef = (uid, nid) => notesRef(uid).doc(nid);
const notesGroupRef = db.collectionGroup('notes');

// Challenges
const challengesRef = db.collection('challenges');
const challengeRef = cid => challengesRef.doc(cid);
const userChallengesRef = uid => userRef(uid).collection('challenges');
const userChallengeRef = (uid, cid) => userChallengesRef(uid).doc(cid);

// Genres
const genreRef = gid => db.collection('genres').doc(gid);
const genreFollowersRef = gid => genreRef(gid).collection('followers');
const genreFollowerRef = (gid, uid) => genreFollowersRef(gid).doc(uid);

// Recommendations
const userRecommendationsRef = uid => db.collection('recommendations').doc(uid);

// Groups
const groupsRef = db.collection('groups');
const groupRef = gid => groupsRef.doc(gid);
const groupFollowersRef = gid => groupRef(gid).collection('followers');
const groupFollowerRef = (gid, uid) => groupFollowersRef(gid).doc(uid);
const groupDiscussionsRef = gid => groupRef(gid).collection('discussions');
const groupDiscussionRef = (gid, did) => groupDiscussionsRef(gid).doc(did);

// Counters
const countRef = cid => db.collection('counters').doc(cid);

/* STORAGE */
const storageRef = firebase.storage().ref();

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