import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType, locationType } from '../../config/types';
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
    redirectToReferrer: false,
    showPassword: false
  }

  static propTypes = {
    location: locationType,
    openSnackbar: funcType.isRequired
  }

  static defaultProps = {
    location: null
  }

  componentDidMount() {
    this._isMounted = true;
    const { location } = this.props;
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (this._isMounted && email) {
      this.setState(prevState => ({
        data: { ...prevState.data, email }
      }));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

	handleChange = e => {
    e.persist();

    this.setState(prevState => ({ 
      data: { ...prevState.data, [e.target.name]: e.target.value }, 
      errors: { ...prevState.errors, [e.target.name]: null }
    }));
	};

	handleSubmit = e => {
    e.preventDefault();
    const { data } = this.state;
    const errors = this.validate(data);
    
    if (this._isMounted) this.setState({ authError: '', errors });
    
		if (Object.keys(errors).length === 0) {
      if (this._isMounted) this.setState({ loading: true });
			auth.signInWithEmailAndPassword(data.email, data.password).then(() => {
        if (this._isMounted) {
          this.setState({
            loading: false,
            redirectToReferrer: true
          });
        }
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

	validate = data => {
		const errors = {};
		if (data.email) {
			if (!isEmail(data.email)) errors.email = "Email non valida";
    } else errors.email = "Inserisci un indirizzo email";
    if (data.password) {
      if (data.password.length < 8) errors.password = "Password troppo corta";
    } else errors.password = "Inserisci una password";
		return errors;
  };
  
  handleClickShowPassword = () => {
    if (this._isMounted) {
      this.setState(prevState => ({ showPassword: !prevState.showPassword }));
    }
  };

  handleMouseDownPassword = e => e.preventDefault();

	render() {
    const { authError, data, errors, loading, redirectToReferrer, showPassword } = this.state;
    const { openSnackbar } = this.props;
    const { from } = { from: { pathname: '/' } };

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div id="loginFormComponent">
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
				<SocialAuth openSnackbar={openSnackbar} />

        <div className="light-text pad-v-xs">
          <small>Effettuando il login confermi la presa visione della <Link to="/privacy">privacy</Link> di {app.name}</small>
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Almeno 8 caratteri"
                value={data.password}
                onChange={this.handleChange}
                error={Boolean(errors.password)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.handleClickShowPassword}
                      onMouseDown={this.handleMouseDownPassword}>
                      {showPassword ? icon.eye() : icon.eyeOff()}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.password && <FormHelperText className="message error">{errors.password}</FormHelperText>}
            </FormControl>
					</div>

					{authError && <div className="row"><div className="col message error">{authError}</div></div>}

					<div className="footer no-gutter">
						<button type="button" className="btn btn-footer primary" onClick={this.handleSubmit}>Accedi</button>
					</div>
				</form>
			</div>
		);
	}
}