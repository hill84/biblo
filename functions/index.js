const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// firebase deploy --only functions

const fn = functions.firestore;
const fs = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// REVIEWS
exports.reviewsFeed = fn.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => {
  const bid = context.params.bid;
  const uid = context.params.uid;
  const feedRef = fs.collection('feeds').doc('latestReviews').collection('reviews').doc(bid);
  const item = change.after.data();

  if (change.after.exists && !change.before.exists) {
    return feedRef.set(item);
  } else if (!change.after.exists && change.before.exists) {
    return feedRef.delete();
  } else {
    return feedRef.update(item);
  }
});

// NOTIFICATIONS
exports.countNotes = fn.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => {
  const uid = context.params.uid;
  const countRef = fs.collection('notifications').doc(uid)
  let increment;
  if (change.after.exists && !change.before.exists) {
    increment = 1;
  } else if (!change.after.exists && change.before.exists) {
    increment = -1;
  } else {
    return null;
  }

  return countRef.get().then(snap => {
    const count = (snap.data().count || 0) + increment;
    return countRef.update({ count });
  });
});

exports.recountNotes = fn.document('notifications/{uid}').onDelete((snap, context) => {
  const uid = context.params.uid;
  const collectionRef = fs.collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
});