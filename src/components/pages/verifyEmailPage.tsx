import { FirestoreError } from '@firebase/firestore-types';
import { ActionCodeSettings } from '@firebase/auth-types';
import { User } from 'firebase';
import React, { FC, useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import classnames from 'classnames';

const VerifyEmailPage: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const sendEmailVerification = (): void => {
    if (auth.currentUser) {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${app.url}/login/?email=${auth.currentUser.email}`
      };
      
      setLoading(true);
      auth.onIdTokenChanged((user: User | null): void => {
        if (user) {
          user.sendEmailVerification(actionCodeSettings).then((): void => {
            setEmailSent(true);
            // FORCE USER RELOAD
            auth.currentUser?.reload().then((): void => {
              auth.currentUser?.getIdToken(true);
            }).catch((err: Error): void => console.warn(err));
          }).catch((err: FirestoreError): void => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally((): void => {
            setLoading(false);
          });
        }
      }), (err: Error): void => console.log(err);
    } else {
      console.log('No currentUser email');
    }
  };

  return (
    <div className='card-container pad-v reveal fadeIn' id='verifyEmailPageComponent'>
      <Helmet>
        <title>{app.name} | Conferma registrazione</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
      <h2>Conferma la tua registrazione</h2>
      <div className='card light' style={{ maxWidth: 360, }}>
        <div className='bubble icon popIn' style={{ marginBottom: 15, }}>{icon.email}</div>
        <p><big>Ti abbiamo inviato un&apos;email di conferma.</big> Per favore, clicca sul link di verifica e poi torna qui per effettuare il <Link to='/login'>login</Link>.</p>
      </div>
      <div className='fadeIn reveal delay20'>
        <p className='sub-footer'>Non trovi l&apos;email? Controlla nella posta indesiderata.</p>
        <p>
          {emailSent ? (
            <span className='btn rounded success reveal fadeIn'>Email inviata</span>
          ) : (
            <button type='button' onClick={sendEmailVerification} className={classnames('btn', 'primary', 'rounded', loading ? 'loading icon' : 'toload')}>{loading ? icon.loading : 'Invia di nuovo'}</button>
          )}
        </p>
      </div>
    </div>
  );
};
 
export default VerifyEmailPage;