const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const fn = functions.firestore;
const fs = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

/* exports.countNotes = fn.document('notifications/{uid}/notes/{nid}').onCreate(event => {
  const uid = event.params.uid;
  const docRef = fs.collection('notifications').doc(uid)

  return docRef.get().then(snap => {
    const count = (snap.data().count || 0) + 1;
    return docRef.update({ count });
  })
}); */

exports.countNotes = fn.document('notifications/{uid}/notes/{nid}').onWrite((change, context) => {
  const uid = context.params.uid;
  const countRef = fs.collection('notifications').doc(uid);

  let increment;
  if (change.after.exists() && !change.before.exists()) {
    increment = 1;
  } else if (!change.after.exists() && change.before.exists()) {
    increment = -1;
  } else {
    return null;
  }

  countRef.transaction(current => (current || 0) + increment);
  console.log('Counter updated.');
  return null;
});

exports.recountNotes = fn.document('notifications/{uid}').onDelete((snap, context) => {
  const uid = context.params.uid;
  const collectionRef = fs.collection('notifications').doc(uid).collection('notes');
  console.log('Counter updated.');
  return collectionRef.delete();
});