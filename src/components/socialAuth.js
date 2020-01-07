import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { auth, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import '../css/socialAuth.css';

const roles = {
  admin: false,
  editor: true,
  premium: false
};

const stats = {
  followed_num: 0,
  followers_num: 0,
  ratings_num: 0,
  reviews_num: 0,
  shelf_num: 0,
  wishlist_num: 0
};

const SocialAuth = props => {
  const { openSnackbar } = useContext(SnackbarContext);
  const { disabled } = props;
  const [loading, setLoading] = useState(false);
  const [redirectToReferrer, setRedirectToReferrer] = useState(false);
  const is = useRef(true);

  const socialAuth = useCallback(provider => {
		auth.signInWithPopup(provider).then(res => {
      if (is.current) setLoading(true);
      
			if (res) {
        const { user } = res;
				if (res.additionalUserInfo.isNewUser) {
          const timestamp = Number((new Date(user.metadata.creationTime)).getTime());
					userRef(user.uid).set({
						creationTime: timestamp,
            displayName: user.displayName,
            email: user.email,
						photoURL: user.photoURL,
						roles,
            stats,
            privacyAgreement: timestamp,
            uid: user.uid,
					});
				}
			}
		}).then(() => {
      if (is.current) {
        setLoading(false);
        setRedirectToReferrer(true);
      }
		}).catch(err => {
      if (is.current) {
        setLoading(false);
        openSnackbar(handleFirestoreError(err), 'error');
      }
    });
  }, [openSnackbar]);
  
	const googleAuth = () => socialAuth(GoogleAuthProvider);
	const facebookAuth = () => socialAuth(FacebookAuthProvider);
	const twitterAuth = () => socialAuth(TwitterAuthProvider);

  const { from } = {from: { pathname: '/' }};

  if (redirectToReferrer) return <Redirect to={from} />

  return (
    <div className="social-auth row" ref={is}>
      <div className="col-4">
        <button type="button" disabled={disabled} className="col btn rounded google" onClick={googleAuth}>Google</button>
      </div>
      <div className="col-4">
        <button type="button" disabled={disabled} className="col btn rounded facebook" onClick={facebookAuth}>Facebook</button>
      </div>
      <div className="col-4">
        <button type="button" disabled={disabled} className="col btn rounded twitter" onClick={twitterAuth}>Twitter</button>
      </div>
      {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
    </div>
  );
}

SocialAuth.propTypes = {
  disabled: boolType
}

SocialAuth.defaultProps = {
  disabled: false
}
 
export default SocialAuth;