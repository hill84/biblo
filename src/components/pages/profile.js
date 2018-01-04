import React from 'react';
import { userAge } from '../../config/shared';
import { auth, userRef } from '../../config/firebase';
import { Avatar, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uid: '',
			user: {
				displayName: '',
				email: '',
				photoURL: '',
				creationTime: '',
				sex: '',
				birth_date: '',
				location: '',
				shelf_num: 0,
				wishlist_num: 0,
				reviews_num: 0,
				ratings_num: 0
			},
			userSnap: {},
			changes: false,
			success: false,
			errors: {},
			authError: ''
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				userRef(user.uid).on('value', snap => {
					this.setState({
						uid: user.uid, 
						userSnap: snap.val()
					});
				});
			}
		});
	}

	handleChange = e => {
		this.setState({ success: false, changes: true, userSnap: { ...this.state.userSnap, [e.target.name]: e.target.value } });
	};

	handleDateChange = (e, date) => {
		this.setState({ success: false, changes: true, userSnap: { ...this.state.userSnap, birth_date: String(date) } });
	};

	handleSelectChange = (e, i, val) => {
		this.setState({ success: false, changes: true, userSnap: { ...this.state.userSnap, sex: val } });
	};

	handleSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.userSnap);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			this.setState({ loading: true });
			userRef(this.state.uid).set({
				...this.state.userSnap,
				photoURL: this.state.userSnap.photoURL || '',
				sex: this.state.userSnap.sex || '',
				birth_date: this.state.userSnap.birth_date || '',
				location: this.state.userSnap.location || ''
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
		if(!user.displayName) errors.displayName = "Inserisci un nome utente";
		if(userAge(user.birth_date) < 13) errors.birth_date = "Devi avere almeno 14 anni";
		return errors;
	};

	render() {
		const { authError, changes, errors, success, userSnap } = this.state;

		return (
			<div id="profileComponent">
				<h2>Profile</h2>
				<div className="card">
					
					<div className="container-sm">
						<div className="row basic-profile">
							<div className="col-auto">
								{userSnap.photoURL ? <Avatar src={userSnap.photoURL} size={80} backgroundColor={'transparent'} /> : userSnap.displayName && <Avatar size={80}>{userSnap.displayName.charAt(0)}</Avatar>}
							</div>
							<div className="col">
								<p className="username">{userSnap.displayName}</p>
								<p className="email">{userSnap.email}</p>
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
									value={userSnap.displayName || ''}
									onChange={this.handleChange}
									fullWidth={true}
								/>
							</div>

							<div className="row">
								<div className="col-6 form-group">
									<SelectField
										name="sex"
										errorText={errors.sex}
										floatingLabelText="Sesso"
										value={userSnap.sex || null}
										onChange={this.handleSelectChange}
										fullWidth={true}
									>
										<MenuItem value={1} primaryText="Uomo" />
										<MenuItem value={2} primaryText="Donna" />
										<MenuItem value={3} primaryText="Altro" />
									</SelectField>
								</div>

								<div className="col-6 form-group">
									<DatePicker 
										name="birth_date"
										hintText="1998-01-01" 
										openToYearSelection={true} 
										errorText={errors.birth_date}
										floatingLabelText="Data di nascita"
										value={userSnap.birth_date ? new Date(userSnap.birth_date) : null}
										onChange={this.handleDateChange}
										fullWidth={true}
									/>
								</div>
							</div>

							{authError && <div className="row"><div className="col message error">{authError}</div></div>}

							<div>&nbsp;</div>
						
							<div className="form-group">
								<button className={`btn centered primary ${success && !changes && 'success'}`} disabled={!changes && 'disabled'} onClick={this.handleSubmit}>{success ? 'Modifiche salvate' : 'Salva le modifiche'}</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}