import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from 'react-router-dom/Link';
import React from 'react';
import Redirect from 'react-router-dom/Redirect';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import { appName } from '../../config/shared';
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
			data: { ...this.state.data, [e.target.name]: e.target.value }, errors: { ...this.state.errors, [e.target.name]: null }
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

        <div className="light-text pad-v-xs">
          <small>Effettuando il login confermi la presa visione della <Link to="/privacy">Privacy policy</Link> di {appName}</small>
        </div>

				<form onSubmit={this.onSubmit} noValidate>
					<div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.email)} htmlFor="email">Email</InputLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoFocus
                placeholder="esempio@esempio.com"
                value={data.email}
                onChange={this.handleChange}
                error={Boolean(errors.email)}
              />
              {errors.email && <FormHelperText className="message error">{errors.email}</FormHelperText>}
            </FormControl>
					</div>

					<div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.password)} htmlFor="password">Password</InputLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Almeno 8 caratteri"
                value={data.password}
                onChange={this.handleChange}
                error={Boolean(errors.password)}
              />
              {errors.password && <FormHelperText className="message error">{errors.password}</FormHelperText>}
            </FormControl>
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