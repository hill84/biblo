import type { DocumentData, DocumentSnapshot, FirestoreError } from '@firebase/firestore-types';
import type { User } from 'firebase';
import type { FC } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';
import { auth, userRef } from '../config/firebase';
import { handleFirestoreError, hasRole } from '../config/shared';
import { uidKey } from '../config/storage';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserContextModel, UserModel } from '../types';

const UserContext = createContext<UserContextModel>({
  emailVerified: false,
  isAdmin: false,
  isAuth: false,
  isAuthor: false,
  isEditor: false,
  isPremium: false,
});

export default UserContext;

export const UserProvider: FC = ({ children }) => {
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [luid, setLuid] = useLocalStorage<string>(uidKey, '');
  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [isAuth, setIsAuth] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  const needsEmailVerification = useMemo((): boolean => !currentUser?.emailVerified && currentUser?.providerData.length === 0, [currentUser]);
  const isAdmin = useMemo((): boolean => Boolean(user && hasRole(user, 'admin')), [user]);
  const isAuthor = useMemo((): boolean => Boolean(user && hasRole(user, 'author')), [user]);
  const isEditor = useMemo((): boolean => Boolean(user && hasRole(user, 'editor')), [user]);
  const isPremium = useMemo((): boolean => Boolean(user && hasRole(user, 'premium')), [user]);

  const provided = useMemo((): UserContextModel => ({
    emailVerified, error, isAuth, isAdmin, isAuthor, isEditor, isPremium, user 
  }), [ 
    emailVerified, error, isAuth, isAdmin, isAuthor, isEditor, isPremium, user 
  ]);

  const fetchUser = (uid: string): void => {
    userRef(uid).onSnapshot((snap: DocumentSnapshot<DocumentData>): void => {
      if (snap.exists) {
        setUser(snap.data() as UserModel);
        setError('');
      } else console.warn('User not found in database');
    }, (err: Error): void => {
      setError(handleFirestoreError(err as FirestoreError));
      setUser(undefined);
    });
  };

  useEffect(() => {
    auth.onIdTokenChanged((user: User | null): void => {
      const uid: string = user?.uid || luid as string || '';
      if (user) {
        setCurrentUser(auth.currentUser);
        setLuid(auth.currentUser?.uid || '');
        if (uid && !needsEmailVerification) {
          setIsAuth(true);
          fetchUser(uid);
          setEmailVerified(true);
        } else {
          setIsAuth(false);
          setUser(undefined);
          setEmailVerified(false);
        }
      } else {
        setIsAuth(false);
        setCurrentUser(null);
        setLuid('');
        setUser(undefined);
      }
    });
    // eslint-disable-next-line
  }, [needsEmailVerification]);

  return (
    <UserContext.Provider value={provided}>
      {children}
    </UserContext.Provider>
  );
};