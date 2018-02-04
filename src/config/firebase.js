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

firebase.initializeApp(config);

export const storageKey = 'KEY_FOR_LOCAL_STORAGE';
export const isAuthenticated = () => !!auth.currentUser || !!localStorage.getItem(storageKey);
export const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
export const TwitterAuthProvider = new firebase.auth.TwitterAuthProvider();
export const auth = firebase.auth();

export const db = firebase.firestore();
export const userRef = uid => db.collection('users').doc(uid);
export const UserBooksRef = uid => db.collection('shelves').doc(uid);
export const UserShelfBookRef = (uid, bid) => db.collection('shelves').doc(uid).collection('shelf').doc(bid);

export const bookRef = bid => db.collection('books').doc(bid);
export const booksRef = db.collection('books');

export default firebase;