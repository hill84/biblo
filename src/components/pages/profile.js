import React from 'react';
import { userAge } from '../../config/shared';
import { auth, userRef } from '../../config/firebase';
import { Avatar, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {},
			changes: false,
			success: false,
			errors: {},
			authError: ''
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				userRef(user.uid).get().then(doc => {
					if (doc.exists) {
						this.setState({ 
							user: doc.data()
						});
					}
				});
			}
		});
	}

	onChange = e => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, [e.target.name]: e.target.value } });
	};

	onChangeDate = (e, date) => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, birth_date: String(date) } });
	};

	onChangeSelect = type => (e, i, val) => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, [type]: val } });
	};

	onSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.user);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			this.setState({ loading: true });
			userRef(this.props.uid).set({
				...this.state.user,
				photoURL: this.state.user.photoURL || '',
				sex: this.state.user.sex || '',
				birth_date: this.state.user.birth_date || '',
				location: this.state.user.location || ''
			}).then(() => {
				this.setState({ 
					loading: false,
					changes: false,
					success: true
				});
				//this.setState({ redirectToReferrer: true });
			}).catch(error => {
				this.setState({
					authError: error.message,
					loading: false
				});
			});
		}
	};

	validate = user => {
		const errors = {};
		if (!user.displayName) errors.displayName = "Inserisci un nome utente";
		if (new Date(user.birth_date) > new Date()) {
			errors.birth_date = "Data di nascita non valida"
		} else if (userAge(user.birth_date) < 13) {
			errors.birth_date = "Devi avere almeno 14 anni";
		}
		return errors;
	};

	render(props) {
		const { authError, changes, errors, success, user } = this.state;

		if (!user) return null;

		return (
			<div id="profileComponent">
				<h2>Profile</h2>
				<div className="card">
					
					<div className="container-sm">
						<div className="row basic-profile">
							<div className="col-auto">
								{user.photoURL ? <Avatar src={user.photoURL} size={80} backgroundColor={'transparent'} /> : user.displayName && <Avatar size={80}>{user.displayName.charAt(0)}</Avatar>}
							</div>
							<div className="col">
								<p className="username">{user.displayName}</p>
								<p className="email">{user.email}</p>
							</div>
						</div>

						<div>&nbsp;</div>

						<form onSubmit={this.onSubmit} noValidate>
							<div className="form-group">
								<TextField
									name="displayName"
									type="text"
									hintText="Mario Rossi"
									errorText={errors.displayName}
									floatingLabelText="Nome e cognome"
									value={user.displayName || ''}
									onChange={this.onChange}
									fullWidth={true}
								/>
							</div>

							<div className="row">
								<div className="col-6 form-group">
									<SelectField
										errorText={errors.sex}
										floatingLabelText="Sesso"
										value={user.sex || null}
										onChange={this.onChangeSelect("sex")}
										fullWidth={true}
									>
										<MenuItem value={'male'} primaryText="Uomo" />
										<MenuItem value={'female'} primaryText="Donna" />
									</SelectField>
								</div>

								<div className="col-6 form-group">
									<DatePicker 
										name="birth_date"
										hintText="1998-01-01" 
										openToYearSelection={true} 
										errorText={errors.birth_date}
										floatingLabelText="Data di nascita"
										value={user.birth_date ? new Date(user.birth_date) : null}
										onChange={this.onChangeDate}
										fullWidth={true}
									/>
								</div>
							</div>

							{authError && <div className="row"><div className="col message error">{authError}</div></div>}

							<div>&nbsp;</div>
						
							<div className="form-group">
								<button className={`btn centered primary ${success && !changes && 'success'}`} disabled={!changes && 'disabled'} onClick={this.onSubmit}>{success ? 'Modifiche salvate' : 'Salva le modifiche'}</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}