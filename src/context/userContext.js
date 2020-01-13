import PropTypes from 'prop-types';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { auth, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { ifLocalStorage, uidKey } from '../config/storage';

const UserContext = createContext({ error: null, user: null });

export default UserContext;

export const UserProvider = props => {
  const { children } = props;
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  const needsEmailVerification = useMemo(() => currentUser && !currentUser.emailVerified && currentUser.providerData.length === 0, [currentUser]);

  const uid = useMemo(() => currentUser && currentUser.uid, [currentUser]);

  const userProvided = useMemo(() => ({ 
    emailVerified, error, isAuth, user 
  }), [ 
    emailVerified, error, isAuth, user 
  ]);

  const fetchUser = useCallback(uid => userRef(uid).onSnapshot(snap => {
    if (snap.exists) {
      setUser(snap.data());
      setError(null);
    } else console.warn(`User not found in database`);
  }, err => {
    setError(handleFirestoreError(err));
    setUser(null);
  }), []);

  useEffect(() => {
    auth.onIdTokenChanged(user => {
      const uid = (user && user.uid) || ifLocalStorage(localStorage.getItem(uidKey));
      if (user) {
        setCurrentUser(auth.currentUser);
        if (uid && !needsEmailVerification) {
          setIsAuth(true);
          fetchUser(uid);
          setEmailVerified(true);
        } else {
          setIsAuth(false);
          setUser(null);
          setEmailVerified(false);
        }
      } else {
        setIsAuth(false);
        setCurrentUser(null);
        setUser(null);
      }
    });

    return () => fetchUser;
  }, [fetchUser, needsEmailVerification]);

  useEffect(() => {
    try {
      window.localStorage.setItem(uidKey, uid);
    } catch(err) {
      console.warn(err);
    }
  }, [uid]);

  return (
    <UserContext.Provider
      value={userProvided}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.element.isRequired
}