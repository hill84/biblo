import React from 'react';
import isEmail from 'validator/lib/isEmail';
import { TextField, CircularProgress } from 'material-ui';
import { auth } from '../../config/firebase.js';

export default class PasswordResetForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			loading: false,
			errors: {}
		};
	}

	handleChange = e => {
		this.setState({ email: e.target.value });
	};

	handleSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.email);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			auth.sendPasswordResetEmail(this.state.email).then(() => {
				this.setState({redirectToReferrer: true});
			});
		}
	};

	validate = data => {
		const errors = {};
		if(this.state.email) {
			if(!isEmail(this.state.email)) errors.email = "Email non valida";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		return errors;
	};

	render() {
		return (
			<div className="card-container" id="passwordResetFormComponent">
				<h2>Recupero password</h2>
				<div className="card">
					<p>Per favore, inserisci la tua email per recuperare la password.</p>
                    <form onSubmit={this.onSubmit} noValidate>
                        <div className="form-group">
                            <TextField
                                name="email"
                                type="email"
                                hintText="esempio@esempio.com"
                                errorText={this.state.errors.email}
                                floatingLabelText="Email"
								value={this.state.email}
								onChange={this.handleChange}
                                fullWidth={true}
                            />
                        </div>

                        <div className="footer no-gutter">
                            <button className="btn-footer primary" onClick={this.handleSubmit}>Recupera password</button>
                        </div>
                    </form>
					{this.props.loading ? <div className="loader"><CircularProgress /></div> : ''}
                </div>
			</div>
		);
	}
}