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
exports.feedReviews = fn.document('reviews/{bid}/reviewers/{uid}').onWrite((change, context) => {
  const { bid } = context.params;
  const feedRef = fs.collection('feeds').doc('latestReviews').collection('reviews').doc(bid);
  const item = change.after.data();

  if (change.after.exists && !change.before.exists) return feedRef.set(item);
  if (!change.after.exists && change.before.exists) return feedRef.delete();
  return feedRef.update(item);
});

// NOTIFICATIONS
exports.countNotes = fn.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => {
  let increment;
  if (change.after.exists && !change.before.exists) {
    increment = 1;
  } else if (!change.after.exists && change.before.exists) {
    increment = -1;
  } else {
    return null;
  }
  
  const { uid } = context.params;
  const countRef = fs.collection('notifications').doc(uid);
  const snap = countRef.get();
  const count = (snap.data().count || 0) + increment;

  return countRef.update({ count });
});

exports.clearSubNotes = fn.document('notifications/{uid}').onDelete((snap, context) => {
  const { uid } = context.params;
  const collectionRef = fs.collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
});