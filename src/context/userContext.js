import PropTypes from 'prop-types';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { auth, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { uidKey } from '../config/storage';
import useLocalStorage from '../hooks/useLocalStorage';

const UserContext = createContext({ error: null, user: null });

export default UserContext;

export const UserProvider = props => {
  const { children } = props;
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [luid, setLuid] = useLocalStorage(uidKey, null);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  const needsEmailVerification = useMemo(() => !currentUser?.emailVerified && currentUser?.providerData.length === 0, [currentUser]);

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
      const uid = user?.uid || luid;
      if (user) {
        setCurrentUser(auth.currentUser);
        setLuid(auth.currentUser.uid);
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
        setLuid(null);
        setUser(null);
      }
    });
    // eslint-disable-next-line
  }, [fetchUser, needsEmailVerification]);

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