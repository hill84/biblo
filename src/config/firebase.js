import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/firestore';
import '@firebase/storage';

const config = {
	apiKey: "AIzaSyDmzwyXa4bBotGhyXN3r5ZAchDmua8a5i0",
	authDomain: "delibris-4fa3b.firebaseapp.com",
	databaseURL: "https://delibris-4fa3b.firebaseio.com",
	projectId: "delibris-4fa3b",
	storageBucket: "delibris-4fa3b.appspot.com",
	messagingSenderId: "144759497905"
};

if (!firebase.apps.length) firebase.initializeApp(config);

/* AUTH */
export const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
export const TwitterAuthProvider = new firebase.auth.TwitterAuthProvider();
export const auth = firebase.auth();
export const signOut = () => auth.signOut();

export const storageKey_uid = 'uid';
export const isAuthenticated = () => !!auth.currentUser || !!localStorage.getItem(storageKey_uid);
export let authid = (auth.currentUser && auth.currentUser.uid) || localStorage.getItem(storageKey_uid);
auth.onAuthStateChanged(user => user ? authid = ((auth.currentUser && auth.currentUser.uid) || localStorage.getItem(storageKey_uid)) : null);
// auth.onAuthStateChanged(user => user ? isAuthenticated() ? console.log(`${user.uid} authenticated`) : console.log(`Not authenticated`) : console.log(`No user`));

/* FIRESTORE */
const db = firebase.firestore();
db.settings({/* my settings... */ timestampsInSnapshots: true});
export const FieldValue = firebase.firestore.FieldValue;
export const timestamp = FieldValue.serverTimestamp();
// export const timestamp = firebase.ServerValue;

export const usersRef = db.collection('users');
export const userRef = uid => db.collection('users').doc(uid);
export const userShelfRef = uid => db.collection('shelves').doc(uid);
export const userBooksRef = uid => db.collection('shelves').doc(uid).collection('books');
export const userBookRef = (uid, bid) => db.collection('shelves').doc(uid).collection('books').doc(bid);
export const followersRef = uid => db.collection('followers').doc(uid);
export const followingsRef = uid => db.collection('followings').doc(uid);

export const booksRef = db.collection('books');
export const bookRef = bid => db.collection('books').doc(bid);

export const collectionsRef = db.collection('collections');
export const collectionRef = cid => db.collection('collections').doc(cid);
export const collectionBooksRef = cid => db.collection('collections').doc(cid).collection('books');
export const collectionFollowersRef = cid => db.collection('collections').doc(cid).collection('followers');
export const collectionBookRef = (cid, bid) => db.collection('collections').doc(cid).collection('books').doc(bid);

export const reviewsRef = db.collection('reviews');
export const reviewRef = bid => db.collection('reviews').doc(bid);
export const reviewersRef = bid => db.collection('reviews').doc(bid).collection('reviewers');
export const reviewerRef = (bid, uid) => db.collection('reviews').doc(bid).collection('reviewers').doc(uid);
export const latestReviewsRef = db.collection('feeds').doc('latestReviews').collection('reviews');

export const authorsRef = db.collection('authors');
export const authorRef = aid => db.collection('authors').doc(aid);

export const quotesRef = db.collection('quotes');
export const quoteRef = qid => db.collection('quotes').doc(qid);

export const notificationsRef = db.collection('notifications');
export const notesRef = uid => db.collection('notifications').doc(uid).collection('notes');
export const noteRef = (uid, nid) => db.collection('notifications').doc(uid).collection('notes').doc(nid);

/* STORAGE */
const storage = firebase.storage();
export const storageRef = (folder, file) => storage.ref(`${folder}/${file}`);

/* EXPORT */
export default firebase;