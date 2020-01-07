import PropTypes from 'prop-types';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth, userRef } from '../config/firebase';
import { handleFirestoreError, needsEmailVerification } from '../config/shared';
import { uidKey } from '../config/storage';

const UserContext = createContext({ error: null, user: null });

export default UserContext;

export const UserProvider = props => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { children } = props;

  const userProvided = useMemo(() => ({ 
    error, setError, 
    user, setUser 
  }), [
    error, setError, 
    user, setUser
  ]);

  useEffect(() => {
    const clearUser = () => setUser(null);

    const fetchUser = user => userRef(user.uid).onSnapshot(snap => {
      if (snap.exists) {
        setUser(snap.data());
        setError(null);
      } else console.warn(`User not found in database`);
    }, err => {
      setError(handleFirestoreError(err));
    });

    auth.onIdTokenChanged(user => {
      if (user && !needsEmailVerification(user)) {
        fetchUser(user);
      } else {
        clearUser();
      }
    });

    return () => fetchUser();
  }, []);

  useEffect(() => {
    const uid = user && user.uid;
    try {
      window.localStorage.setItem(uidKey, uid);
    } catch(err) {
      console.warn(err);
    }
  }, [user]);

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