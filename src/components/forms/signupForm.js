import React from 'react';
import { Redirect } from 'react-router-dom';
//import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';
import { TextField } from 'material-ui';
import { auth } from '../../config/firebase.js';

export default class SignupForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {
				email: '',
				password: ''
			},
			loading: false,
			errors: {},
			redirectToReferrer: false
		};
	}

	handleChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	handleSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.data);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			//this.props.submit(this.state.data);
			auth.createUserWithEmailAndPassword(this.state.data.email, this.state.data.password).then(() => {
				this.setState({redirectToReferrer: true});
			});
		}
	};

	validate = data => {
		const errors = {};
		if(data.email) {
			if(!isEmail(data.email)) errors.email = "Email non valida";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		if (!data.password) { 
			errors.password = "Inserisci una password";
		} else if (data.password.length < 8) {
			errors.password = "Password troppo corta";
		}
		return errors;
	};

	render(props) {
		const { data, errors, redirectToReferrer } = this.state;
		const { from } = '/';

		return (
			<div id="signupFormComponent">
				{redirectToReferrer && (
					<Redirect to={from || '/dashboard'}/>
				)}
				{from && (
					<p>You must log in to view the page at {from.pathname}</p>
				)}
				<div className="row socialButtons" onClick={this.props.closeAuthDialog }>
					<div className="col-4">
						<button className="btnGoogle" onClick={this.props.googleAuth}>Google</button>
					</div>
					<div className="col-4">
						<button className="btnFacebook" onClick={this.props.facebookAuth}>Facebook</button>
					</div>
					<div className="col-4">
						<button className="btnTwitter" onClick={this.props.twitterAuth}>Twitter</button>
					</div>
				</div>

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

					<div className="footer no-gutter">
						<button className="btn-footer primary" onClick={this.handleSubmit}>Registrati</button>
					</div>
				</form>
			</div>
		);
	}
}
/*
SignupForm.propTypes = {
	submit: PropTypes.func.isRequired
}
*/