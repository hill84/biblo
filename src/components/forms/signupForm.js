import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType } from '../../config/types';
import SocialAuth from '../socialAuth';

const labelStyle = { marginRight: 0, };
const formStyle = { marginTop: 20, };

const max = {
  chars: {
    displayName: 50,
    email: 254,
    password: 50
  }
};

const min = {
  chars: { password: 8 }
};

export default class SignupForm extends Component {
	state = {
    checkedTerms: false, 
    data: {
      uid: '',
      displayName: '',
      email: '',
      password: '',
      roles: {
        admin: false,
        editor: true,
        premium: false
      },
      stats: {
        ratings_num: 0,
        reviews_num: 0,
        shelf_num: 0,
        wishlist_num: 0
      }
    },
    loading: false,
    errors: {},
    authError: '',
    redirectTo: null,
    showPassword: false
  };

  static propTypes = {
    openSnackbar: funcType.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggleCheckbox = e => {
    e.persist();
    const { name, checked } = e.target;

    this.setState(prevState => ({ 
      [name]: checked,
      errors: { ...prevState.errors, [name]: null }
    }));
  }

	onChange = e => {
    e.persist();
    const { name, value } = e.target;

    if (this._isMounted) {
      this.setState(prevState => ({ 
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };
  
	validate = data => {
    const errors = {};

    if (!this.state.checkedTerms) {
      errors.checkedTerms = "Spunta la casella obbligatoria"; 
    }

    const name = data.displayName.toLowerCase();

		if (!data.displayName) { 
      errors.displayName = "Inserisci un nome utente"; 
    } else if (name === 'admin' || name === 'amministratore' || name.startsWith('biblo')) {
      errors.displayName = "Nome utente non permesso"; 
      // TODO: check further forbidden names
    } else if (data.displayName.length > max.chars.displayName) {
      errors.displayName = `Massimo ${max.chars.displayName} caratteri`
    }

		if (!data.email) {
      errors.email = "Inserisci un indirizzo email";
    } else if (!isEmail(data.email)) {
      errors.email = "Email non valida";
		} else if (data.email.length > max.chars.email) {
      errors.password = `Massimo ${max.chars.email} caratteri`;
    }

		if (!data.password) {
      errors.password = "Inserisci una password"; 
    } else if (data.password.length < min.chars.password) {
      errors.password = `Minimo ${min.chars.password} caratteri`;
    } else if (data.password.length > max.chars.password) {
      errors.password = `Massimo ${max.chars.password} caratteri`;
    }
    // TODO: check password strength
		return errors;
  };

	onSubmit = e => {
    e.preventDefault();
    const { data } = this.state;
    const { openSnackbar } = this.props;
    const errors = this.validate(data);
    
    if (this._isMounted) this.setState({ authError: '', errors });
    
		if (Object.keys(errors).length === 0) {
      if (this._isMounted) this.setState({ loading: true });
      auth.createUserWithEmailAndPassword(data.email, data.password).then(user => {
        if (!user) {
          if (this._isMounted) {
            this.setState({
              authError: 'No user is signed in',
              loading: false
            });
          }
        }
      }).catch(err => {
        if (this._isMounted) {
          this.setState({
            authError: handleFirestoreError(err),
            loading: false
          });
        }
      });

      auth.onAuthStateChanged(user => {
        if (user) {
          const timestamp = Number((new Date(user.metadata.creationTime)).getTime());
          userRef(user.uid).set({
            creationTime: timestamp,
            displayName: data.displayName,
            email: user.email,
            photoURL: '',
            roles: data.roles,
            stats: data.stats,
            termsAgreement: timestamp, 
            privacyAgreement: timestamp,
            uid: user.uid,
          }).then().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }
      });

      auth.onIdTokenChanged(user => {
        if (user) {
          if (user.emailVerified === false) {
            const actionCodeSettings = {
              url: `${app.url}/login/?email=${auth.currentUser.email}`
            };
            user.sendEmailVerification(actionCodeSettings).then(() => {
              if (this._isMounted) this.setState({ redirectTo: '/verify-email' });
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          }
        }
      });
		}
	};

  handleClickShowPassword = () => {
    if (this._isMounted) {
      this.setState(prevState => ({ showPassword: !prevState.showPassword }));
    }
  };

  handleMouseDownPassword = e => e.preventDefault();

	render() {
    const { authError, checkedTerms, data, errors, loading, redirectTo, showPassword } = this.state;
    const { openSnackbar } = this.props;

		if (redirectTo) return <Redirect to={redirectTo} />

		return (
			<>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <FormControlLabel 
          className="text-left" 
          style={labelStyle}
          required
          label={(
            <span className="text-sm">
              Accetto i <Link to="/terms">termini</Link> e confermo la visione della <Link to="/privacy">privacy</Link> di {app.name}
            </span>
          )}
          control={(
            <Checkbox
              checked={checkedTerms}
              onChange={this.toggleCheckbox}
              name="checkedTerms"
            />
          )}
        />
        {errors.checkedTerms && <FormHelperText className="message error">{errors.checkedTerms}</FormHelperText>}
        
        <form onSubmit={this.onSubmit} noValidate style={formStyle}>
          <SocialAuth disabled={!checkedTerms} openSnackbar={openSnackbar} />
          <div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.displayName)} htmlFor="displayName">Nome e cognome</InputLabel>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                autoFocus
                placeholder="Mario Rossi"
                value={data.displayName}
                onChange={this.onChange}
                error={Boolean(errors.displayName)}
              />
              {errors.displayName && <FormHelperText className="message error">{errors.displayName}</FormHelperText>}
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.email)} htmlFor="email">Email</InputLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="esempio@esempio.com"
                value={data.email}
                onChange={this.onChange}
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Almeno 8 caratteri"
                value={data.password}
                onChange={this.onChange}
                error={Boolean(errors.password)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.handleClickShowPassword}
                      onMouseDown={this.handleMouseDownPassword}>
                      {showPassword ? icon.eye : icon.eyeOff}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && <FormHelperText className="message error">{errors.password}</FormHelperText>}
            </FormControl>
          </div>

          {authError && <div className="row"><div className="col message error">{authError}</div></div>}

          <div className="footer no-gutter">
            <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Registrati</button>
          </div>
        </form>
			</>
		);
	}
}