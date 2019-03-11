import React from 'react';
import { Link } from 'react-router-dom';
import { icon } from '../../config/icons';

const VerifyEmailPage = props => (
	<div className="card-container pad-v reveal fadeIn" id="verifyEmailPageComponent">
		<h2>Conferma la tua registrazione</h2>
		<div className="card" style={{maxWidth: 360}}>
      <div className="bubble icon popIn" style={{marginBottom: 15}}>{icon.email()}</div>
			<p><big>Ti abbiamo inviato un'email di conferma.</big> Per favore, clicca sul link di verifica e poi torna qui per effettuare il <Link to="/login">login</Link>.</p>
		</div>
		<p className="sub-footer">Non trovi l'email? Controlla tra la posta indesiderata.</p>
	</div>
);

export default VerifyEmailPage;