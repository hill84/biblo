import TextField from 'material-ui/TextField';
import React from 'react';
import Redirect from 'react-router-dom/Redirect';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import SocialAuth from '../socialAuth';

export default class LoginForm extends React.Component {
	state = {
    data: {
      email: '',
      password: ''
    },
    loading: false,
    errors: {},
    authError: '',
    redirectToReferrer: false
  }

	handleChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	handleSubmit = e => {
		e.preventDefault();
		this.setState({ loading: true });
		const errors = this.validate(this.state.data);
		this.setState({ authError: '', errors });
		if(Object.keys(errors).length === 0) {
			auth.signInWithEmailAndPassword(this.state.data.email, this.state.data.password).then(() => {
				this.setState({
					redirectToReferrer: true
				});
			}).catch(error => {
				this.setState({
					authError: error.message,
					loading: false
				});
			});
		}
	};

	validate = data => {
		const errors = {};
		if(data.email) {
			if(!isEmail(data.email)) errors.email = "Email non valida";
		} else { errors.email = "Inserisci un indirizzo email"; }
		if (!data.password) { errors.password = "Inserisci una password"; } 
		return errors;
	};

	render() {
		const { authError, data, errors, redirectToReferrer } = this.state;
    const { from } = {from: { pathname: '/' }};

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div id="loginFormComponent">
				<SocialAuth />

				<form onSubmit={this.onSubmit} noValidate>
					<div className="form-group">
						<TextField
							name="email"
							type="email"
							hintText="esempio@esempio.com"
							errorText={errors.email}
							floatingLabelText="Email"
							value={data.email}
							onChange={this.handleChange}
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
							onChange={this.handleChange}
							fullWidth={true}
						/>
					</div>

					{authError && <div className="row"><div className="col message error">{authError}</div></div>}

					<div className="footer no-gutter">
						<button className="btn btn-footer primary" onClick={this.handleSubmit}>Accedi</button>
					</div>
				</form>
			</div>
		);
	}
}