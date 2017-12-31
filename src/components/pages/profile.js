import React from 'react';
import { Avatar } from 'material-ui';
import { auth } from '../../config/firebase.js';
import { TextField, CircularProgress } from 'material-ui';
import isEmail from 'validator/lib/isEmail';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {
				uid: '',
				displayName: '',
				email: '',
				photoURL: '',
				registration_date: null,
				shelf_num: 0,
				wishlist_num: 0
			},
			loading: false,
			errors: {}
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			this.setState({ user });
		});
	}

	handleChange = e => {
		this.setState({ 
			user: { ...this.state.user, [e.target.name]: e.target.value }
		});
	};

	handleSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.user);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			this.setState({loading: true});
			auth.currentUser.updateProfile(this.state.user).then(() => {
				this.setState({loading: false});
				//this.setState({redirectToReferrer: true});
			});
		}
	};

	validate = user => {
		const errors = {};
		if(user.email) {
			if(!isEmail(user.email)) errors.email = "Email non valida";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		if(!user.displayName) errors.displayName = "Inserisci un nickname";
		return errors;
	};

	render() {
		const { user, loading, errors } = this.state;

		if(!user) return null;

		return (
			<div id="profileComponent">
				<h2>Profile</h2>
				<div className="card">
					{loading ? <div className="loader"><CircularProgress /></div> : ''}
					{user.photoURL ? <Avatar src={user.photoURL} /> : <Avatar>{user.displayName.charAt(0)}</Avatar>}
					<p>{user.displayName}</p>
					<p>{user.email}</p>

					<form onSubmit={this.onSubmit} noValidate>
						<div className="form-group">
							<TextField
								name="email"
								type="email"
								hintText="esempio@esempio.com"
								errorText={errors.email}
								floatingLabelText="Email"
								value={user.email}
								onChange={this.handleChange}
								fullWidth={true}
							/>
						</div>

						<div className="form-group">
							<TextField
								name="displayName"
								type="text"
								hintText="Mario Rossi"
								errorText={errors.displayName}
								floatingLabelText="Nome e cognome"
								value={(user.displayName) ? user.displayName : ''}
								onChange={this.handleChange}
								fullWidth={true}
							/>
						</div>

						<div className="footer no-gutter">
							<button className="btn btn-footer primary" onClick={this.handleSubmit}>Salva le modifiche</button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}