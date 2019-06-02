import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import { handleFirestoreError } from '../../config/shared';

export default class PasswordResetForm extends React.Component {
  state = {
    email: '',
    loading: false,
    authError: null,
    errors: {}
  }
  
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

	onChange = e => {
    if (this._isMounted) {
      this.setState({ email: e.target.value, errors: { ...this.state.errors, [e.target.name]: null } });
    }
	};

	onSubmit = e => {
    e.preventDefault();
    const { openSnackbar } = this.props;
    const { email } = this.state;
    const errors = this.validate(email);

    if (this._isMounted) this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      if (this._isMounted) this.setState({ loading: true });
      auth.sendPasswordResetEmail(email).then(() => {
        if (this._isMounted) this.setState({ emailSent: true, loading: false });
        openSnackbar(`Ti abbiamo inviato un'email per reimpostare la password.`, 'success');
      }).catch(err => {
        if (this._isMounted) {
          this.setState({
            authError: handleFirestoreError(err),
            loading: false
          });
        }
      });
    }
	};

	validate = () => {
    const { email } = this.state;
    const errors = {};
    
		if (email) {
			if (!isEmail(email)) errors.email = "Formato email non valido";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		return errors;
	};

	render() {
		const { authError, email, emailSent, errors, loading } = this.state;

		return (
			<div className="card-container pad-v" id="passwordResetFormComponent">
				<h2>Recupero password</h2>
				<div className="card light">
					<p>Per favore, inserisci la tua email per recuperare la password.</p>
          <form noValidate>
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
              {emailSent ? 
                <span className="btn btn-footer success">Email inviata</span> :
                <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Recupera password</button>
              }
            </div>
          </form>
          {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        </div>
			</div>
		);
	}
}