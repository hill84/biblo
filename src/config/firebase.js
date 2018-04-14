import firebase from 'firebase';
import 'firebase/firestore';

const config = {
	apiKey: "AIzaSyDmzwyXa4bBotGhyXN3r5ZAchDmua8a5i0",
	authDomain: "delibris-4fa3b.firebaseapp.com",
	databaseURL: "https://delibris-4fa3b.firebaseio.com",
	projectId: "delibris-4fa3b",
	storageBucket: "delibris-4fa3b.appspot.com",
	messagingSenderId: "144759497905"
};

if (!firebase.apps.length) firebase.initializeApp(config);

const db = firebase.firestore();
const storage = firebase.storage();
export const timestamp = firebase.database.ServerValue.TIMESTAMP;

export const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
export const TwitterAuthProvider = new firebase.auth.TwitterAuthProvider();
export const auth = firebase.auth();

export const storageKey_uid = 'uid';
export const isAuthenticated = () => !!auth.currentUser || !!localStorage.getItem(storageKey_uid);
export const uid = auth.currentUser || localStorage.getItem(storageKey_uid);

export const userRef = uid => db.collection('users').doc(uid);
export const userBooksRef = uid => db.collection('shelves').doc(uid).collection('books');
export const userBookRef = (uid, bid) => db.collection('shelves').doc(uid).collection('books').doc(bid);

export const bookRef = bid => db.collection('books').doc(bid);
export const booksRef = db.collection('books');

export const collectionsRef = cid => db.collection('collections').doc(cid).collection('books');

export const reviewsRef = bid => db.collection('reviews').doc(bid).collection('reviewers');

export const storageRef = (folder, file) => storage.ref(`${folder}/${file}`)

export default firebase;