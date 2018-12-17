const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// firebase deploy --only functions

const fn = functions.firestore;
const fs = admin.firestore();

// const timestamp = snap.get('created_at');
// const date = timestamp.toDate();

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

  if (change.after.exists && !change.before.exists) return feedRef.set(item); // add review to feed
  if (!change.after.exists && change.before.exists) return feedRef.delete(); // remove review from feed
  return feedRef.update(item);
});

exports.truncateFeedReviews = fn.document('reviews/{bid}/reviewers/{uid}').onCreate((change, context) => {
  const latestReviewsRef = fs.collection('feeds').doc('latestReviews');
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
});

// NOTIFICATIONS
exports.countNotes = fn.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => {
  let increment;
  if (change.after.exists && !change.before.exists) { increment = 1 } else 
  if (!change.after.exists && change.before.exists) { increment = -1 } else { return null };
  
  const { uid } = context.params;
  const countRef = fs.collection('notifications').doc(uid);
  const snap = countRef.get();
  const count = (snap.data().count || 0) + increment;

  return countRef.update({ count });
});

exports.clearSubNotes = fn.document('notifications/{uid}').onDelete((change, context) => {
  const { uid } = context.params;
  const collectionRef = fs.collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
});