import React, { useEffect, useRef, useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';

const VerifyEmailPage = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const sendEmailVerification = () => {
    if (is.current) setLoading(true);

    const actionCodeSettings = {
      url: `${app.url}/login/?email=${auth.currentUser.email}`
    };

    auth.onIdTokenChanged(user => {
      user.sendEmailVerification(actionCodeSettings).then(() => {
        if (is.current) {
          setEmailSent(true);
          setLoading(false);
        }
        // FORCE USER RELOAD
        auth.currentUser.reload().then(() => {
          auth.currentUser.getToken(true);
        }).catch(err => console.warn(err));
      }).catch(err => {
        if (is.current) setLoading(false);
        openSnackbar(handleFirestoreError(err), 'error');
      });
    });
  }

  return (
    <div className="card-container pad-v reveal fadeIn" id="verifyEmailPageComponent">
      <Helmet>
        <title>{app.name} | Conferma registrazione</title>
        <link rel="canonical" href={app.url} />
      </Helmet>
      <h2>Conferma la tua registrazione</h2>
      <div className="card light" style={{ maxWidth: 360, }}>
        <div className="bubble icon popIn" style={{ marginBottom: 15, }}>{icon.email}</div>
        <p><big>Ti abbiamo inviato un&apos;email di conferma.</big> Per favore, clicca sul link di verifica e poi torna qui per effettuare il <Link to="/login">login</Link>.</p>
      </div>
      <div className="fadeIn reveal delay20">
        <p className="sub-footer">Non trovi l&apos;email? Controlla nella posta indesiderata.</p>
        <p>{emailSent ? 
          <span className="btn rounded success reveal fadeIn">Email inviata</span> : 
          <button type="button" onClick={sendEmailVerification} className={`btn btn primary rounded ${loading ? 'loading icon' : 'toload'}`}>{loading ? icon.loading : 'Invia di nuovo'}</button>
        }</p>
      </div>
    </div>
  );
}
 
export default VerifyEmailPage;