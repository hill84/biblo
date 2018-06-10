import TextField from 'material-ui/TextField';
import React from 'react';
import Redirect from 'react-router-dom/Redirect';
import isEmail from 'validator/lib/isEmail';
import { auth, userRef } from '../../config/firebase';
import SocialAuth from '../socialAuth';

export default class SignupForm extends React.Component {
	state = {
    data: {
      uid: '',
      displayName: '',
      email: '',
      password: '',
      roles: {
        admin: false,
        editor: true
      },
      stats: {
        followed_num: 0,
        followers_num: 0,
        ratings_num: 0,
        reviews_num: 0,
        shelf_num: 0,
        wishlist_num: 0
      }
    },
    loading: false,
    errors: {},
    authError: '',
    redirectToReferrer: false
  };

	onChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	onSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.data);
		this.setState({ authError: '', errors });
		if(Object.keys(errors).length === 0) {
			auth.createUserWithEmailAndPassword(this.state.data.email, this.state.data.password).catch(error => {
				this.setState({
					authError: error.message,
					loading: false
				});
			});
			auth.onAuthStateChanged(user => {
				if (user) {
					userRef(user.uid).set({
						uid: user.uid,
						displayName: this.state.data.displayName,
						email: user.email,
						creationTime: user.metadata.creationTime,
						roles: this.state.roles,
						stats: this.state.stats
					});
					this.setState({ 
						redirectToReferrer: true 
					});
				}
			});
		}
	};

	validate = data => {
		const errors = {};
		if (!data.displayName) { errors.displayName = "Inserisci un nome utente"; }
		if(data.email) { 
			if(!isEmail(data.email)) errors.email = "Email non valida";
		} else { errors.email = "Inserisci un indirizzo email"; }
		if (!data.password) { errors.password = "Inserisci una password"; 
		} else if (data.password.length < 8) { errors.password = "Password troppo corta"; }
		return errors;
	};

	render(props) {
    const { authError, data, errors, redirectToReferrer } = this.state;
		const { from } = {from: { pathname: '/profile' }};

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div ref="signupFormComponent">
				<SocialAuth />

				<form onSubmit={this.onSubmit} noValidate>
					<div className="form-group">
						<TextField
							name="displayName"
							type="text"
							hintText="Mario Rossi"
							errorText={errors.displayName}
							floatingLabelText="Nome"
							value={data.displayName}
							onChange={this.onChange}
							fullWidth={true}
						/>
					</div>

					<div className="form-group">
						<TextField
							name="email"
							type="email"
							hintText="esempio@esempio.com"
							errorText={errors.email}
							floatingLabelText="Email"
							value={data.email}
							onChange={this.onChange}
							fullWidth={true}
						/>
					</div>

					<div className="form-group">
						<TextField
							name="password"
							type="password"
							hintText="Almeno 8 caratteri"
							errorText={errors.password}
							floatingLabelText="Password"
							value={data.password}
							onChange={this.onChange}
							fullWidth={true}
						/>
					</div>

					{authError && <div className="row"><div className="col message error">{authError}</div></div>}

					<div className="footer no-gutter">
						<button className="btn btn-footer primary" onClick={this.onSubmit}>Registrati</button>
					</div>
				</form>
			</div>
		);
	}
}