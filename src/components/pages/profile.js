import React from 'react';
import { calcAge, languages, continents, europeanCountries, northAmericanCountries, italianProvinces, validateImg } from '../../config/shared';
import { local_uid, storageRef, userRef } from '../../config/firebase';
import { CircularProgress, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';
import Avatar from '../avatar';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			imgPreview: null,
			imgProgress: 0,
			loading: true,
			changes: false,
			success: false,
			errors: {},
			authError: ''
		}
	}

	componentDidMount() {
		userRef(local_uid).onSnapshot(snap => {
			this.setState({ loading: false });
			if (snap.exists) {
				this.setState({ 
					user: snap.data(),
					imgPreview: snap.data().photoURL || ''
				});
			} else {
				this.setState({
					loading: false 
				});
			}
		});
	}

	onChange = e => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, [e.target.name]: e.target.value } });
	};

	onChangeDate = key => (e, date) => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, [key]: String(date) } });
	};

	onChangeSelect = key => (e, i, val) => {
		this.setState({ success: false, changes: true, user: { ...this.state.user, [key]: val } });
	};

	onSubmit = e => {
		e.preventDefault();
		const errors = this.validate(this.state.user);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			this.setState({ loading: true });
			userRef(local_uid).set({
				...this.state.user,
				photoURL: this.state.imgPreview || '',
				sex: this.state.user.sex || '',
				birth_date: this.state.user.birth_date || '',
				city: this.state.user.city || '',
				country: this.state.user.country || ''
			}).then(() => {
				this.setState({ 
					imgProgress: 0,
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
		if (Date(user.birth_date) > new Date()) {
			errors.birth_date = "Data di nascita non valida"
		} else if (calcAge(user.birth_date) < 13) {
			errors.birth_date = "Età minima 14 anni";
		}
		if (user.city && user.city.length > 150) errors.city = "Lunghezza massima 150 caratteri";
		return errors;
	};

	onImageChange = e => {
		e.preventDefault();
		const file = e.target.files[0];
		//console.log(file);
		const errors = validateImg(file, 1048576);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			const uploadTask = storageRef(`users/${local_uid}`, 'avatar').put(file);
			uploadTask.on('state_changed', snap => {
				this.setState({
					imgProgress: (snap.bytesTransferred / snap.totalBytes) * 100
				});
			}, error => {
				console.warn('upload error: ' + error);
				errors.upload = true;
			}, () => {
				//console.log('upload completed');
				this.setState({
					imgPreview: uploadTask.snapshot.downloadURL,
					changes: true,
					success: false
				});
			});
		}
	};

	render(props) {
		const { authError, changes, errors, imgPreview, loading, imgProgress, success, user } = this.state;
		//const menuItemsMap = arr => arr.map(item => <MenuItem value={item.id} key={item.id} primaryText={item.name} />);
		const menuItemsMap = (arr, values) => arr.map(item => 
			<MenuItem 
				value={item.name} 
				key={item.id} 
				insetChildren={values ? true : false} 
				checked={values ? values.includes(item.name) : false} 
				primaryText={item.name} 
			/>
		);
		
		if (!user) return null;

		return (
			<div className="container" ref="profileComponent">
				{loading && <div className="loader"><CircularProgress /></div>}
				<div className="card">
					
					<div className="container-sm">
						<div className="row basic-profile">
							
							<div className="col-auto">
								<div className={`upload-avatar ${errors.upload ? 'error' : ''}`}>
									<Avatar size={80} src={imgPreview} alt={user.displayName} />
									<div className="overlay">
										<span title="Carica un'immagine">+</span>
										<input type="file" accept="image/*" className="upload" onChange={e => this.onImageChange(e)}/>
									</div>
									<progress type="progress" value={imgProgress} max="100" className="progress">0%</progress>
								</div>
							</div>
							<div className="col">
								<div className="username">{user.displayName}</div>
								<div className="email">{user.email}</div>
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
										<MenuItem value={'m'} primaryText="Uomo" />
										<MenuItem value={'f'} primaryText="Donna" />
										<MenuItem value={'x'} primaryText="Altro" />
									</SelectField>
								</div>

								<div className="col-6 form-group">
									<DatePicker 
										name="birth_date"
										hintText="1998-01-01" 
										cancelLabel="Annulla"
										openToYearSelection={true} 
										errorText={errors.birth_date}
										floatingLabelText="Data di nascita"
										value={user.birth_date ? new Date(user.birth_date) : null}
										onChange={this.onChangeDate("birth_date")}
										fullWidth={true}
									/>
								</div>
							</div>

							<div className="form-group">
								<SelectField
									floatingLabelText={`Lingue conosciute ${user.languages && this.state.user.languages.length > 1 ? ` (${this.state.user.languages.length})` : ""}`}
									value={user.languages || null}
									onChange={this.onChangeSelect("languages")}
									fullWidth={true}
									multiple={true}
								>
									{menuItemsMap(languages, user.languages)}
								</SelectField>
							</div>

							<div className="form-group">
								<SelectField
									floatingLabelText="Continente"
									value={user.continent || null}
									onChange={this.onChangeSelect("continent")}
									fullWidth={true}
								>
									{menuItemsMap(continents)}
								</SelectField>
							</div>

							{(user.continent === 'Europa' || user.continent === 'Nordamerica') && 
								<div className="form-group">
									<SelectField
										floatingLabelText="Nazione"
										value={user.country || null}
										onChange={this.onChangeSelect("country")}
										fullWidth={true}
										maxHeight={350}
									>
										{(user.continent === 'Europa') && menuItemsMap(europeanCountries)}
										{(user.continent === 'Nordamerica') && menuItemsMap(northAmericanCountries)}
									</SelectField>
								</div>
							}

							<div className="form-group">
								{(user.country) && (user.country === "Italia‎") ?
									<SelectField
										floatingLabelText="Provincia"
										value={user.city || null}
										onChange={this.onChangeSelect("city")}
										fullWidth={true}
										maxHeight={300}
									>
										{menuItemsMap(italianProvinces)}
									</SelectField>
								:
									<TextField
										name="city"
										type="text"
										hintText="es: New York"
										errorText={errors.city}
										floatingLabelText="Città"
										value={user.city || ''}
										onChange={this.onChange}
										fullWidth={true}
									/>
								}
							</div>

							{authError && <div className="info-row"><div className="message error">{authError}</div></div>}

							<div>&nbsp;</div>

						</form>
					</div>
					<div className="footer no-gutter">
						<button className={`btn btn-footer primary ${success && !changes && 'success'}`} disabled={!changes && 'disabled'} onClick={this.onSubmit}>{success ? 'Modifiche salvate' : 'Salva le modifiche'}</button>
					</div>
				</div>
			</div>
		);
	}
}