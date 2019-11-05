const functions = require('firebase-functions');
const admin = require('firebase-admin');
/* const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs'); */

admin.initializeApp();

// firebase deploy --only functions

// const timestamp = snap.get('created_at');
// const date = timestamp.toDate();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// HELPERS
const ff = functions.region('europe-west1').firestore;

const count = (doc, change, collection, field, nestedField) => {
  let increment;
  if (change == 1 || change == -1) {
    increment = change;
  } else {
    if (change.after.exists && !change.before.exists) { increment = 1 } else 
    if (!change.after.exists && change.before.exists) { increment = -1 } else { return null };
  }
  const countRef = admin.firestore().collection(collection || 'counters').doc(doc);
  const value = admin.firestore.FieldValue.increment(increment);
  const data = { [field || 'count']: nestedField ? { [nestedField]: value } : value };

  return countRef.set(data, { merge: true });
}

// REVIEWS
exports.incrementReviews = ff.document('reviews/{bid}/reviewers/{uid}').onCreate(() => count('reviews', 1));

exports.decrementReviews = ff.document('reviews/{bid}/reviewers/{uid}').onDelete(() => count('reviews', -1));

exports.countUserReviews = ff.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => count(context.params.uid, change, 'users', 'stats', 'reviews_num'));

exports.countBookReviews = ff.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => count(context.params.bid, change, 'books', 'reviews_num'));

/* exports.feedReviews = ff.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => {
  const { bid } = context.params;
  const feedRef = admin.firestore().collection('feeds').doc('latestReviews').collection('reviews').doc(bid);
  const item = change.after.data();

  if (change.after.exists && !change.before.exists) return feedRef.set(item); // add review to feed
  if (!change.after.exists && change.before.exists) return feedRef.delete(); // remove review from feed
  return feedRef.update(item);
});

exports.truncateFeedReviews = ff.document('reviews/{bid}/reviewers/{uid}').onCreate((snap, context) => {
  const latestReviewsRef = admin.firestore().collection('feeds').doc('latestReviews');
  const reviewsRef = latestReviewsRef.collection('reviews');
    
  return reviewsRef.orderBy('created_num', 'desc').get().then(snap => {
    const oldReviews = [];
    let count = snap.size;

    snap.forEach(doc => oldReviews.push(doc.data()));
    if (oldReviews.length > 12) {
      reviewsRef.doc(oldReviews[oldReviews.length - 1].bid).delete();
      count = count - 1;
    }
    const lastActivity = oldReviews[0].created_num;
    const data = { count, lastActivity };
    return latestReviewsRef.update(data);
  }).catch(err => console.log(err));
}); */

// NOTIFICATIONS
exports.incrementNotifications = ff.document('notifications/{nid}').onCreate(() => count('notifications', 1));

exports.decrementNotifications = ff.document('notifications/{nid}').onDelete(() => count('notifications', -1));

/* exports.countNotes = ff.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => count(context.params.uid, change, 'notifications')); */

exports.incrementNotes = ff.document('notifications/{uid}/notes/{nid}').onCreate((snap, context) => count(context.params.uid, 1, 'notifications'));

exports.decrementNotes = ff.document('notifications/{uid}/notes/{nid}').onDelete((snap, context) => count(context.params.uid, -1, 'notifications'));

/* exports.clearSubNotes = ff.document('notifications/{uid}').onDelete((snap, context) => {
  const { uid } = context.params;
  const collectionRef = admin.firestore().collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
}); */

// COLLECTIONS
exports.incrementCollections = ff.document('collections/{cid}').onCreate(() => count('collections', 1));

exports.decrementCollections = ff.document('collections/{cid}').onDelete(() => count('collections', -1));

exports.countCollectionBooks = ff.document('collections/{cid}/books/{bid}').onWrite((change, context) => count(context.params.cid, change, 'collections', 'books_num'));

// BOOKS
exports.incrementBooks = ff.document('books/{bid}').onCreate(() => count('books', 1));

exports.decrementBooks = ff.document('books/{bid}').onDelete(() => count('books', -1));

exports.clearBook = ff.document('books/{bid}').onDelete((snap, context) => {
  const { bid } = context.params;
  const item = snap.data();

  if ((item.collections || []).length > 0) {
    item.collections.forEach(cid => {
      admin.firestore().collection('collections').doc(cid).collection('books').doc(bid).delete(); // delete book from each collection
    });
  }

  const ReviewsRef = admin.firestore().collection('reviews').doc(bid);

  ReviewsRef.collection('reviewers').get().then(snap => {
    if (!snap.empty) {
      snap.forEach(reviewer => {
        ReviewsRef.collection('reviewers').doc(reviewer.id).delete(); // delete book reviews
      });
    } else { ReviewsRef.delete(); } // delete book from reviews
  });
  return admin.storage().bucket().deleteFiles({ prefix: `books/${bid}` }); // delete folder in storage
});

// USERS
exports.incrementUsers = ff.document('users/{uid}').onCreate(() => count('users', 1));

exports.decrementUsers = ff.document('users/{uid}').onDelete(() => count('users', -1));

exports.clearUserAuth = ff.document('users/{uid}').onDelete((snap, context) => admin.auth().deleteUser(context.params.uid));

exports.clearUserFiles = ff.document('users/{uid}').onDelete((snap, context) => admin.storage().bucket().deleteFiles({ prefix: `users/${context.params.uid}` }));

// AUTHORS
exports.incrementAuthors = ff.document('authors/{aid}').onCreate(() => count('authors', 1));

exports.decrementAuthors = ff.document('authors/{aid}').onDelete(() => count('authors', -1));

// QUOTES
exports.incrementQuotes = ff.document('quotes/{qid}').onCreate(() => count('quotes', 1));

exports.decrementQuotes = ff.document('quotes/{qid}').onDelete(() => count('quotes', -1));

// CHALLENGES
exports.incrementChallenges = ff.document('challenges/{cid}').onCreate(() => count('challenges', 1));

exports.decrementChallenges = ff.document('challenges/{cid}').onDelete(() => count('challenges', -1));