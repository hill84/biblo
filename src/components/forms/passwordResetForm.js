import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';

export default class PasswordResetForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			loading: false,
			authError: null,
			errors: {}
		};
	}

	onChange = e => {
		this.setState({ email: e.target.value, errors: { ...this.state.errors, [e.target.name]: null } });
	};

	onSubmit = e => {
		e.preventDefault();
		this.setState({ loading: true });
		const errors = this.validate(this.state.email);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			auth.sendPasswordResetEmail(this.state.email).then(() => {
				this.setState({ redirectToReferrer: true });
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
		if(this.state.email) {
			if(!isEmail(this.state.email)) errors.email = "Email non valida";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		return errors;
	};

	render() {
		const { authError, email, errors } = this.state;

		return (
			<div className="card-container" id="passwordResetFormComponent">
				<h2>Recupero password</h2>
				<div className="card">
					<p>Per favore, inserisci la tua email per recuperare la password.</p>
          <form onSubmit={this.onSubmit} noValidate>
            <div className="form-group">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.email)} htmlFor="email">Email</InputLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="esempio@esempio.com"
                  value={email}
                  onChange={this.onChange}
                  error={Boolean(errors.email)}
                />
                {errors.email && <FormHelperText className="message error">{errors.email}</FormHelperText>}
              </FormControl>
            </div>
            
            {authError && <div className="row"><div className="col message error">{authError}</div></div>}

            <div className="footer no-gutter">
              <button className="btn btn-footer primary" onClick={this.onSubmit}>Recupera password</button>
            </div>
          </form>
          {this.props.loading && <div className="loader"><CircularProgress /></div>}
        </div>
			</div>
		);
	}
}