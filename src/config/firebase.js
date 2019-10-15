import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/performance';
import { isLocalStorage, needsEmailVerification } from './shared';

const config = {
	apiKey: "AIzaSyDmzwyXa4bBotGhyXN3r5ZAchDmua8a5i0",
	authDomain: "biblo.space", // delibris-4fa3b.firebaseapp.com
	databaseURL: "https://delibris-4fa3b.firebaseio.com",
	projectId: "delibris-4fa3b",
	storageBucket: "delibris-4fa3b.appspot.com",
	messagingSenderId: "144759497905"
};

if (!firebase.apps.length) firebase.initializeApp(config);

const perf = firebase.performance();

/* AUTH */
export const GoogleAuthProvider = firebase.auth && new firebase.auth.GoogleAuthProvider();
export const FacebookAuthProvider = firebase.auth && new firebase.auth.FacebookAuthProvider();
export const TwitterAuthProvider = firebase.auth && new firebase.auth.TwitterAuthProvider();
export const auth = firebase.auth();
auth.useDeviceLanguage();
export const signOut = () => auth.signOut();

export const storageKey_uid = 'uid';
export const isAuthenticated = () => (!!auth.currentUser && !needsEmailVerification(auth.currentUser)) /* || !!localStorage.getItem(storageKey_uid) */;
export let authid = (auth.currentUser && auth.currentUser.uid) || (isLocalStorage() && localStorage.getItem(storageKey_uid));
auth.onIdTokenChanged(user => user ? authid = ((auth.currentUser && auth.currentUser.uid) || (isLocalStorage() && localStorage.getItem(storageKey_uid))) : null);
// auth.onIdTokenChanged(user => user ? isAuthenticated() ? console.log(`${user.uid} authenticated`) : console.log(`Not authenticated`) : console.log(`No user`));

/* FIRESTORE */
const db = firebase.firestore();
db.settings({/* my settings... */});
export const FieldValue = firebase.firestore.FieldValue;
export const timestamp = FieldValue.serverTimestamp();
// export const timestamp = firebase.ServerValue;

export const usersRef = db.collection('users');
export const userRef = uid => usersRef.doc(uid);
export const userShelfRef = uid => db.collection('shelves').doc(uid);
export const userBooksRef = uid => userShelfRef(uid).collection('books');
export const userBookRef = (uid, bid) => userBooksRef(uid).doc(bid);
export const followersRef = uid => db.collection('followers').doc(uid);
export const followingsRef = uid => db.collection('followings').doc(uid);

export const booksRef = db.collection('books');
export const bookRef = bid => booksRef.doc(bid);

export const collectionsRef = db.collection('collections');
export const collectionRef = cid => collectionsRef.doc(cid);
export const collectionBooksRef = cid => collectionRef(cid).collection('books');
export const collectionFollowersRef = cid => collectionRef(cid).collection('followers');
export const collectionBookRef = (cid, bid) => collectionBooksRef(cid).doc(bid);

export const reviewsRef = db.collection('reviews');
export const reviewRef = bid => reviewsRef.doc(bid);
export const reviewersRef = bid => reviewRef(bid).collection('reviewers');
export const reviewerRef = (bid, uid) => reviewersRef(bid).doc(uid);
export const reviewersGroupRef = db.collectionGroup('reviewers');

export const authorsRef = db.collection('authors');
export const authorRef = aid => authorsRef.doc(aid);
export const authorFollowersRef = aid => authorRef(aid).collection('followers');

export const quotesRef = db.collection('quotes');
export const quoteRef = qid => quotesRef.doc(qid);

export const notificationsRef = db.collection('notifications');
export const userNotificationsRef = uid => notificationsRef.doc(uid);
export const notesRef = uid => userNotificationsRef(uid).collection('notes');
export const noteRef = (uid, nid) => notesRef(uid).doc(nid);

export const challengesRef = db.collection('challenges');
export const challengeRef = cid => challengesRef.doc(cid);
export const userChallengesRef = uid => db.collection('users').doc(uid).collection('challenges');
export const userChallengeRef = (uid, cid) => userChallengesRef(uid).doc(cid);

export const genreRef = gid => db.collection('genres').doc(gid);
export const genreFollowersRef = gid => genreRef(gid).collection('followers');

export const countRef = cid => db.collection('counters').doc(cid);

/* STORAGE */
const storage = firebase.storage();
export const storageRef = (folder, file) => storage.ref(`${folder}/${file}`);

/* EXPORT */
export default firebase;