const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const gcs = require('@google-cloud/storage')();
// const spawn = require('child-process-promise').spawn;
// const path = require('path');
// const os = require('os');
// const fs = require('fs');

admin.initializeApp();

// HELPERS
const ff = functions.region('europe-west1').firestore;

const count = ({
  doc,
  change,
  collection = 'counters',
  field = 'count',
  nestedField
}) => {
  let increment;

  if (change === 1 || change === -1) {
    increment = change;
  } else {
    if (change.after.exists && !change.before.exists) { increment = 1 } else 
    if (!change.after.exists && change.before.exists) { increment = -1 } else { return null }
  }

  const countRef = admin.firestore().doc(`${collection}/${doc}`);
  const value = admin.firestore.FieldValue.increment(increment);
  const data = { [field]: nestedField ? { [nestedField]: value } : value };

  return countRef.set(data, { merge: true });
};

// REVIEWS
exports.incrementReviews = ff.document('reviews/{bid}/reviewers/{uid}').onCreate(() => count({ doc: 'reviews', change: 1 }));

exports.decrementReviews = ff.document('reviews/{bid}/reviewers/{uid}').onDelete(() => count({ doc: 'reviews', change: -1 }));

exports.incrementUserReviews = ff.document('reviews/{bid}/reviewers/{uid}').onCreate((snap, context) => count({
  doc: context.params.uid, change: 1, collection: 'users', field: 'stats', nestedField: 'reviews_num' 
}));

exports.decrementUserReviews = ff.document('reviews/{bid}/reviewers/{uid}').onDelete((snap, context) => count({
  doc: context.params.uid, change: -1, collection: 'users', field: 'stats', nestedField: 'reviews_num' 
}));

exports.incrementBookReviews = ff.document('reviews/{bid}/reviewers/{uid}').onCreate((snap, context) => count({ 
  doc: context.params.bid, change: 1, collection: 'books', field: 'reviews_num' 
}));

exports.decrementBookReviews = ff.document('reviews/{bid}/reviewers/{uid}').onDelete((snap, context) => count({
  doc: context.params.bid, change: -1, collection: 'books', field: 'reviews_num' 
}));

exports.incrementReviewsComments = ff.document('reviews/{bid}/reviewers/{uid}/commenters/{cid}').onCreate((snap, context) => count({ 
  doc: context.params.uid, change: 1, collection: `reviews/${context.params.bid}/reviewers`, field: 'comments_num' 
}));

exports.decrementReviewsComments = ff.document('reviews/{bid}/reviewers/{uid}/commenters/{cid}').onDelete((snap, context) => count({
  doc: context.params.uid, change: -1, collection: `reviews/${context.params.bid}/reviewers`, field: 'comments_num' 
}));

// ADMIN
exports.incrementDeletedUsers = ff.document('admin/deleted/users/{uid}').onCreate(() => count({ doc: 'deleted-users', change: 1 }));

exports.decrementDeletedUsers = ff.document('admin/deleted/users/{uid}').onDelete(() => count({ doc: 'deleted-users', change: -1 }));

exports.flagReview = ff.document('reviews/{bid}/reviewers/{uid}').onUpdate((change, context) => {
  if (change.before.exists && change.after.exists) {
    const { bid, uid } = context.params;
    const { flag } = change.after.data();
    const ref = admin.firestore().doc(`admin/flagged/reviews/${bid}/reviewers/${uid}`);

    if (flag) {
      const data = { bid, uid, ...flag };
      return ref.set(data, { merge: true }).then(() => count({ doc: 'flagged-reviews', change: 1 }));
    } 
    return ref.delete().then(() => count({ doc: 'flagged-reviews', change: -1 }));
  }
  return false;
});

exports.flagComment = ff.document('reviews/{bid}/reviewers/{uid}/commenters/{cid}').onUpdate((change, context) => {
  if (change.before.exists && change.after.exists) {
    const { bid, cid, uid } = context.params;
    const { flag } = change.after.data();
    const ref = admin.firestore().doc(`admin/flagged/reviews/${bid}/reviewers/${uid}/commenters/${cid}`);

    if (flag) {
      const data = { bid, cid, uid, ...flag };
      return ref.set(data, { merge: true }).then(() => count({ doc: 'flagged-comments', change: 1 }));
    }
    return ref.delete().then(() => count({ doc: 'flagged-comments', change: -1 }));
  }
  return false;
});

exports.flagDiscussion = ff.document('groups/{gid}/discussions/{did}').onUpdate((change, context) => {
  if (change.before.exists && change.after.exists) {
    const { did, gid } = context.params;
    const { flag } = change.after.data();
    const ref = admin.firestore().doc(`admin/flagged/groups/${gid}/discussions/${did}`);

    if (flag) {
      const data = { did, gid, ...flag };
      return ref.set(data, { merge: true }).then(() => count({ doc: 'flagged-discussions', change: 1 }));
    }
    return ref.delete().then(() => count({ doc: 'flagged-discussions', change: -1 }));
  }
  return false;
});

// NOTIFICATIONS
exports.incrementNotifications = ff.document('notifications/{nid}').onCreate(() => count({ doc: 'notifications', change: 1 }));

exports.decrementNotifications = ff.document('notifications/{nid}').onDelete(() => count({ doc: 'notifications', change: -1 }));

exports.incrementNotes = ff.document('notifications/{uid}/notes/{nid}').onCreate((snap, context) => count({ 
  doc: context.params.uid, change: 1, collection: 'notifications' 
}));

exports.decrementNotes = ff.document('notifications/{uid}/notes/{nid}').onDelete((snap, context) => count({
  doc: context.params.uid, change: -1, collection: 'notifications' 
}));

/* exports.clearSubNotes = ff.document('notifications/{uid}').onDelete((snap, context) => {
  const { uid } = context.params;
  const collectionRef = admin.firestore().collection('notifications').doc(uid).collection('notes');

  return collectionRef.delete();
}); */

// COLLECTIONS
exports.incrementCollections = ff.document('collections/{cid}').onCreate(() => count({ doc: 'collections', change: 1 }));

exports.decrementCollections = ff.document('collections/{cid}').onDelete(() => count({ doc: 'collections', change: -1 }));

exports.incrementCollectionBooks = ff.document('collections/{cid}/books/{bid}').onCreate((snap, context) => count({ 
  doc: context.params.cid, change: 1, collection: 'collections', field: 'books_num' 
}));

exports.decrementCollectionBooks = ff.document('collections/{cid}/books/{bid}').onDelete((snap, context) => count({ 
  doc: context.params.cid, change: -1, collection: 'collections', field: 'books_num' 
}));

// BOOKS
exports.incrementBooks = ff.document('books/{bid}').onCreate(() => count({ doc: 'books', change: 1 }));

exports.decrementBooks = ff.document('books/{bid}').onDelete(() => count({ doc: 'books', change: -1 }));

exports.clearBook = ff.document('books/{bid}').onDelete((snap, context) => {
  const { bid } = context.params;
  const item = snap.data();

  if ((item.collections || []).length > 0) {
    item.collections.forEach(cid => {
      admin.firestore().collection('collections').doc(cid).collection('books').doc(bid).delete(); // delete book from each collection
    });
  }

  const ReviewRef = admin.firestore().collection('reviews').doc(bid);

  const ReviewersRef = ReviewRef.collection('reviewers');

  ReviewersRef.get().then(snap => {
    if (!snap.empty) {
      snap.forEach(reviewer => {
        const ReviewerRef = ReviewersRef.doc(reviewer.id);

        const reviewerCommentersRef = ReviewerRef.collection('commenters');

        reviewerCommentersRef.get().then(snap => {
          if (!snap.empty) {
            snap.forEach(commenter => {
              reviewerCommentersRef.doc(commenter.id).delete(); // delete comments
            });
          } else { ReviewerRef.delete() } // delete reviewers
        });

      });
    } else { ReviewRef.delete() } // delete reviews
  });
  return admin.storage().bucket().deleteFiles({ prefix: `books/${bid}` }); // delete folder in storage
});

// USERS
exports.incrementUsers = ff.document('users/{uid}').onCreate(() => count({ doc: 'users', change: 1 }));

exports.decrementUsers = ff.document('users/{uid}').onDelete(() => count({ doc: 'users', change: -1 }));

exports.clearUserAuth = ff.document('users/{uid}').onDelete((snap, context) => admin.auth().deleteUser(context.params.uid));

exports.clearUserFiles = ff.document('users/{uid}').onDelete((snap, context) => admin.storage().bucket().deleteFiles({ prefix: `users/${context.params.uid}` }));

exports.clearUserData = ff.document('users/{uid}').onDelete((snap, context) => {
  const { uid } = context.params;
  const { creationTime, displayName, email } = snap.data();

  admin.firestore().collection('shelves').doc(uid).delete(); // delete user shelf
  admin.firestore().collection('followers').doc(uid).delete(); // delete user followers
  admin.firestore().collection('followings').doc(uid).delete(); // delete user followings
  admin.firestore().collection('recommendations').doc(uid).delete(); // delete user recommendations

  const data = { creationTime, displayName, email, deletionTime: Date.now(), uid };

  return admin.firestore().collection('admin').doc('deleted').collection('users').doc(uid).set(data, { merge: true });
});

// AUTHORS
exports.incrementAuthors = ff.document('authors/{aid}').onCreate(() => count({ doc: 'authors', change: 1 }));

exports.decrementAuthors = ff.document('authors/{aid}').onDelete(() => count({ doc: 'authors', change: -1 }));

// QUOTES
exports.incrementQuotes = ff.document('quotes/{qid}').onCreate(() => count({ doc: 'quotes', change: 1 }));

exports.decrementQuotes = ff.document('quotes/{qid}').onDelete(() => count({ doc: 'quotes', change: -1 }));

// CHALLENGES
exports.incrementChallenges = ff.document('challenges/{cid}').onCreate(() => count({ doc: 'challenges', change: 1 }));

exports.decrementChallenges = ff.document('challenges/{cid}').onDelete(() => count({ doc: 'challenges', change: -1 }));

// GROUPS
exports.incrementGroups = ff.document('groups/{gid}').onCreate(() => count({ doc: 'groups', change: 1 }));

exports.decrementGroups = ff.document('groups/{gid}').onDelete(() => count({ doc: 'groups', change: -1 }));

exports.incrementGroupFollowers = ff.document('groups/{gid}/followers/{uid}').onCreate((snap, context) => count({ 
  doc: context.params.gid, change: 1, collection: 'groups', field: 'followers_num' 
}));

exports.decrementGroupFollowers = ff.document('groups/{gid}/followers/{uid}').onDelete((snap, context) => count({ 
  doc: context.params.gid, change: -1, collection: 'groups', field: 'followers_num' 
}));