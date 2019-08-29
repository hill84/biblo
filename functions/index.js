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
const count = (doc, change, collection, field) => {
  let increment;
  if (change.after.exists && !change.before.exists) { increment = 1 } else 
  if (!change.after.exists && change.before.exists) { increment = -1 } else { return null };
  const countRef = admin.firestore().collection(collection || 'counters').doc(doc);
  const data = { [field || 'count']: admin.firestore.FieldValue.increment(increment) };

  return countRef.set(data, { merge: true });
}

// REVIEWS
exports.countReviews = functions.firestore.document('reviews/{bid}/reviewers/{uid}').onWrite(change => count('reviews', change));

exports.countUserReviews = functions.firestore.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => count(context.params.uid, change, 'users', 'stats.reviews_num'));

exports.countBookReviews = functions.firestore.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => count(context.params.bid, change, 'books', 'reviews_num'));

/* exports.feedReviews = functions.firestore.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => {
  const { bid } = context.params;
  const feedRef = admin.firestore().collection('feeds').doc('latestReviews').collection('reviews').doc(bid);
  const item = change.after.data();

  if (change.after.exists && !change.before.exists) return feedRef.set(item); // add review to feed
  if (!change.after.exists && change.before.exists) return feedRef.delete(); // remove review from feed
  return feedRef.update(item);
});

exports.truncateFeedReviews = functions.firestore.document('reviews/{bid}/reviewers/{uid}').onCreate((snap, context) => {
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
exports.countNotifications = functions.firestore.document('notifications/{nid}').onWrite(change => count('notifications', change));

exports.countNotes = functions.firestore.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => count(context.params.uid, change, 'notifications'));

/* exports.clearSubNotes = functions.firestore.document('notifications/{uid}').onDelete((snap, context) => {
  const { uid } = context.params;
  const collectionRef = admin.firestore().collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
}); */

// COLLECTIONS
exports.countCollections = functions.firestore.document('collections/{cid}').onWrite(change => count('collections', change));

exports.countCollectionBooks = functions.firestore.document('collections/{cid}/books/{bid}').onWrite((change, context) => count(context.params.cid, change, 'collections', 'books_num'));

// BOOKS
exports.countBooks = functions.firestore.document('books/{bid}').onWrite(change => count('books', change));

exports.clearBook = functions.firestore.document('books/{bid}').onDelete((snap, context) => {
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
exports.countUsers = functions.firestore.document('users/{uid}').onWrite(change => count('users', change));

exports.clearUserAuth = functions.firestore.document('users/{uid}').onDelete((snap, context) => admin.auth().deleteUser(context.params.uid));

exports.clearUserFiles = functions.firestore.document('users/{uid}').onDelete((snap, context) => admin.storage().bucket().deleteFiles({ prefix: `users/${context.params.uid}` }));

// AUTHORS
exports.countAuthors = functions.firestore.document('authors/{aid}').onWrite(change => count('authors', change));

// QUOTES
exports.countQuotes = functions.firestore.document('quotes/{qid}').onWrite(change => count('quotes', change));

// CHALLENGES
exports.countChallenges = functions.firestore.document('challenges/{cid}').onWrite(change => count('challenges', change));