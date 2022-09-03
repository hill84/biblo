import { FirestoreError } from '@firebase/firestore-types';
import { ActionCodeSettings } from '@firebase/auth-types';
import { User } from 'firebase';
import React, { FC, useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

const VerifyEmailPage: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { t } = useTranslation(['common']);

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
        <title>{app.name} | {t('PAGE_CONFIRM_SIGNUP')}</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
      <h2>{t('VERIFY_EMAIL_TITLE')}</h2>
      <div className='card light' style={{ maxWidth: 360, }}>
        <div className='bubble icon popIn' style={{ marginBottom: 15, }}>{icon.email}</div>
        <p><big>{t('VERIFY_EMAIL_BIG')}</big> {t('VERIFY_EMAIL_PARAGRAPH')}</p>
      </div>
      <div className='fadeIn reveal delay20'>
        <p className='sub-footer'>
          {t('VERIFY_EMAIL_FOOTER')}
        </p>
        <p>
          {emailSent ? (
            <span className='btn rounded success reveal fadeIn'>
              {t('SUCCESS_EMAIL_SENT')}
            </span>
          ) : (
            <button
              type='button'
              onClick={sendEmailVerification}
              className={classnames('btn', 'sm', 'primary', 'rounded', loading ? 'loading icon' : 'toload')}>
              {loading ? icon.loading : t('ACTION_SEND_AGAIN')}
            </button>
          )}
        </p>
      </div>
    </div>
  );
};
 
export default VerifyEmailPage;