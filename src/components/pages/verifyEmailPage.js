import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { icon } from '../../config/icons';
import { handleFirestoreError } from '../../config/shared';
import { funcType } from '../../config/types';

export default class VerifyEmailPage extends React.Component {
  state = {
    loading: false,
    emailSent: false
  }

  static propTypes = {
    openSnackbar: funcType.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  sendEmailVerification = () => {
    const { openSnackbar } = this.props;

    this._isMounted && this.setState({ loading: true });

    auth.onAuthStateChanged(user => {
      user.sendEmailVerification().then(() => {
        this._isMounted && this.setState({ emailSent: true, loading: false });
      }).catch(err => {
        this._isMounted && this.setState({ loading: false });
        openSnackbar(handleFirestoreError(err), 'error');
      });
    });
  }

  render() { 
    const { emailSent, loading } = this.state;

    return (
      <div className="card-container pad-v reveal fadeIn" id="verifyEmailPageComponent">
        <h2>Conferma la tua registrazione</h2>
        <div className="card" style={{maxWidth: 360}}>
          <div className="bubble icon popIn" style={{marginBottom: 15}}>{icon.email()}</div>
          <p><big>Ti abbiamo inviato un'email di conferma.</big> Per favore, clicca sul link di verifica e poi torna qui per effettuare il <Link to="/login">login</Link>.</p>
        </div>
        <p className="sub-footer">Non trovi l'email? Controlla nella posta indesiderata.</p>
        <p>{emailSent ? 
          <span className="btn rounded success reveal fadeIn">Email inviata</span> : 
          <button type="button" onClick={this.sendEmailVerification} className={`btn btn primary rounded ${loading ? 'loading icon' : 'toload'}`}>{loading ? icon.loading() : 'Invia di nuovo'}</button>
        }</p>
      </div>
    );
  }
}