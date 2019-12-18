import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/performance';
import { needsEmailVerification } from './shared';
import { ifLocalStorage, uidKey } from './storage';

const config = {
	appId: '1:144759497905:web:e8d9fd244452fbbb',
	apiKey: 'AIzaSyDmzwyXa4bBotGhyXN3r5ZAchDmua8a5i0',
	authDomain: 'biblo.space', // delibris-4fa3b.firebaseapp.com
	databaseURL: 'https://delibris-4fa3b.firebaseio.com',
	projectId: 'delibris-4fa3b',
	storageBucket: 'delibris-4fa3b.appspot.com',
	messagingSenderId: '144759497905'
};

if (!firebase.apps.length) firebase.initializeApp(config);

firebase.performance();

/* AUTH */
const GoogleAuthProvider = firebase.auth && new firebase.auth.GoogleAuthProvider();
const FacebookAuthProvider = firebase.auth && new firebase.auth.FacebookAuthProvider();
const TwitterAuthProvider = firebase.auth && new firebase.auth.TwitterAuthProvider();
const auth = firebase.auth();
auth.useDeviceLanguage();
const signOut = () => auth.signOut();
const isAuthenticated = () => Boolean(auth.currentUser) && !needsEmailVerification(auth.currentUser);
const currentUid = () => (auth.currentUser && auth.currentUser.uid) || (ifLocalStorage(localStorage.getItem(uidKey)));
// eslint-disable-next-line import/no-mutable-exports
let authid = currentUid();
auth.onIdTokenChanged(user => {
	authid = user ? currentUid() : null
});
// auth.onIdTokenChanged(user => user ? isAuthenticated() ? console.log(`${user.uid} authenticated`) : console.log(`Not authenticated`) : console.log(`No user`));

/* FIRESTORE */
const db = firebase.firestore();
db.settings({/* my settings... */});
const { FieldValue } = firebase.firestore;
const timestamp = FieldValue.serverTimestamp();
// const timestamp = firebase.ServerValue;

const usersRef = db.collection('users');
const userRef = uid => usersRef.doc(uid);
const userShelfRef = uid => db.collection('shelves').doc(uid);
const userBooksRef = uid => userShelfRef(uid).collection('books');
const userBookRef = (uid, bid) => userBooksRef(uid).doc(bid);

const followersRef = uid => db.collection('followers').doc(uid);
const followingsRef = uid => db.collection('followings').doc(uid);

const booksRef = db.collection('books');
const bookRef = bid => booksRef.doc(bid);

const collectionsRef = db.collection('collections');
const collectionRef = cid => collectionsRef.doc(cid);
const collectionBooksRef = cid => collectionRef(cid).collection('books');
const collectionFollowersRef = cid => collectionRef(cid).collection('followers');
const collectionBookRef = (cid, bid) => collectionBooksRef(cid).doc(bid);

const reviewsRef = db.collection('reviews');
const reviewRef = bid => reviewsRef.doc(bid);
const reviewersRef = bid => reviewRef(bid).collection('reviewers');
const reviewerRef = (bid, uid) => reviewersRef(bid).doc(uid);
const reviewersGroupRef = db.collectionGroup('reviewers');

const authorsRef = db.collection('authors');
const authorRef = aid => authorsRef.doc(aid);
const authorFollowersRef = aid => authorRef(aid).collection('followers');
const quotesRef = db.collection('quotes');
const quoteRef = qid => quotesRef.doc(qid);

const notificationsRef = db.collection('notifications');
const userNotificationsRef = uid => notificationsRef.doc(uid);
const notesRef = uid => userNotificationsRef(uid).collection('notes');
const noteRef = (uid, nid) => notesRef(uid).doc(nid);
const notesGroupRef = db.collectionGroup('notes');

const challengesRef = db.collection('challenges');
const challengeRef = cid => challengesRef.doc(cid);
const userChallengesRef = uid => db.collection('users').doc(uid).collection('challenges');
const userChallengeRef = (uid, cid) => userChallengesRef(uid).doc(cid);

const genreRef = gid => db.collection('genres').doc(gid);
const genreFollowersRef = gid => genreRef(gid).collection('followers');

const countRef = cid => db.collection('counters').doc(cid);

/* STORAGE */
const storage = firebase.storage();
const storageRef = (folder, file) => storage.ref(`${folder}/${file}`);

/* EXPORT */
export {
	GoogleAuthProvider,
	FacebookAuthProvider,
	TwitterAuthProvider,
	auth,
	signOut,
	isAuthenticated,
	authid,
	FieldValue,
	timestamp,
	usersRef,
	userRef,
	userShelfRef,
	userBooksRef,
	userBookRef,
	followersRef,
	followingsRef,
	booksRef,
	bookRef,
	collectionsRef,
	collectionRef,
	collectionBooksRef,
	collectionFollowersRef,
	collectionBookRef,
	reviewsRef,
	reviewRef,
	reviewersRef,
	reviewerRef,
	reviewersGroupRef,
	authorsRef,
	authorRef,
	authorFollowersRef,
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
	countRef,
	storageRef
};
export default firebase;