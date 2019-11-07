import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType } from '../../config/types';

const VerifyEmailPage = props => {
  const [state, setState] = useState({
    emailSent: false,
    loading: false
  });

  const is = useRef(true);
  const { openSnackbar } = props;
  const { emailSent, loading } = state;

  useEffect(() => () => {
    is.current = false;
  }, []);

  const sendEmailVerification = () => {
    if (is.current) setState(prevState => ({ ...prevState, loading: true}));

    const actionCodeSettings = {
      url: `${app.url}/login/?email=${auth.currentUser.email}`
    };

    auth.onIdTokenChanged(user => {
      user.sendEmailVerification(actionCodeSettings).then(() => {
        if (is.current) setState({ emailSent: true, loading: false });
        // FORCE USER RELOAD
        auth.currentUser.reload().then(() => {
          auth.currentUser.getToken(true);
        }).catch(err => console.warn(err));
      }).catch(err => {
        if (is.current) setState(prevState => ({ ...prevState, loading: false }));
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
        <div className="bubble icon popIn" style={{ marginBottom: 15, }}>{icon.email()}</div>
        <p><big>Ti abbiamo inviato un&apos;email di conferma.</big> Per favore, clicca sul link di verifica e poi torna qui per effettuare il <Link to="/login">login</Link>.</p>
      </div>
      <div className="fadeIn reveal" style={{ animationDelay: '2s', }}>
        <p className="sub-footer">Non trovi l&apos;email? Controlla nella posta indesiderata.</p>
        <p>{emailSent ? 
          <span className="btn rounded success reveal fadeIn">Email inviata</span> : 
          <button type="button" onClick={sendEmailVerification} className={`btn btn primary rounded ${loading ? 'loading icon' : 'toload'}`}>{loading ? icon.loading() : 'Invia di nuovo'}</button>
        }</p>
      </div>
    </div>
  );
}

VerifyEmailPage.propTypes = {
  openSnackbar: funcType.isRequired
}
 
export default VerifyEmailPage;