import { AuthProvider, UserCredential } from '@firebase/auth-types';
import { FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { FC, useCallback, useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { auth, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import '../css/socialAuth.css';
import { RolesModel, StatsModel } from '../types';

const roles: RolesModel = {
  admin: false,
  editor: true,
  premium: false
};

const stats: StatsModel = {
  // followed_num: 0,
  // followers_num: 0,
  ratings_num: 0,
  reviews_num: 0,
  shelf_num: 0,
  wishlist_num: 0
};

interface SocialAuthProps {
  disabled?: boolean;
}

interface StateModel {
  loading: boolean;
  redirectToReferrer: boolean;
}

const initialState: StateModel = {
  loading: false,
  redirectToReferrer: false,
};

const SocialAuth: FC<SocialAuthProps> = ({
  disabled = false,
}: SocialAuthProps) => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [redirectToReferrer, setRedirectToReferrer] = useState<boolean>(initialState.redirectToReferrer);

  const socialAuth = useCallback((provider: AuthProvider): void => {
    auth.signInWithPopup(provider).then((userCredential: UserCredential): void => {
      setLoading(true);
      
      if (userCredential.user) {
        const {
          displayName,
          email,
          photoURL = '',
          metadata,
          uid,
        } = userCredential.user;
        if (userCredential.additionalUserInfo?.isNewUser) {
          const timestamp: number = metadata.creationTime ? Number((new Date(metadata.creationTime)).getTime()) : -1;
          userRef(uid).set({
            creationTime: timestamp,
            displayName,
            email,
            photoURL,
            roles,
            stats,
            privacyAgreement: timestamp,
            uid,
          });
        }
      }
    }).then((): void => {
      setRedirectToReferrer(true);
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
      setLoading(false);
    });
  }, [openSnackbar]);

  const { from } = { from: { pathname: '/' }};

  if (redirectToReferrer) return <Redirect to={from} />;

  return (
    <div className='social-auth row'>
      <div className='col-4'>
        <button type='button' disabled={disabled} className='col btn rounded google' onClick={() => socialAuth(GoogleAuthProvider)}>Google</button>
      </div>
      <div className='col-4'>
        <button type='button' disabled={disabled} className='col btn rounded facebook' onClick={() => socialAuth(FacebookAuthProvider)}>Facebook</button>
      </div>
      <div className='col-4'>
        <button type='button' disabled={disabled} className='col btn rounded twitter' onClick={() => socialAuth(TwitterAuthProvider)}>Twitter</button>
      </div>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
    </div>
  );
};
 
export default SocialAuth;