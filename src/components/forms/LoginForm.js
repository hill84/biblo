import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType, locationType } from '../../config/types';
import SocialAuth from '../socialAuth';

const LoginForm = props => {
  const [state, setState] = useState({
    data: {
      email: '',
      password: ''
    },
    loading: false,
    errors: {},
    authError: '',
    redirectToReferrer: false,
    showPassword: false
  });

  const is = useRef(true);
  const { location, openSnackbar } = props;
  const { authError, data, loading, errors, redirectToReferrer, showPassword } = state;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    
    if (is.currenr && email) {
      setState(prevState => ({
        ...prevState,
        data: { ...prevState.data, email }
      }));
    }

    return () => {
      is.current = false;
    }
  }, [location.search]);

  const onChange = e => {
    e.persist();

    setState(prevState => ({
      ...prevState,
      data: { ...prevState.data, [e.target.name]: e.target.value }, 
      errors: { ...prevState.errors, [e.target.name]: null }
    }));
  };
  
  const validate = data => {
		const errors = {};
		if (data.email) {
			if (!isEmail(data.email)) errors.email = "Email non valida";
    } else errors.email = "Inserisci un indirizzo email";
    if (data.password) {
      if (data.password.length < 8) errors.password = "Password troppo corta";
    } else errors.password = "Inserisci una password";
		return errors;
  };

	const onSubmit = e => {
    e.preventDefault();
    const errors = validate(data);
    
    if (is.current) setState(prevState => ({ ...prevState, authError: '', errors }));
    
		if (Object.keys(errors).length === 0) {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));
			auth.signInWithEmailAndPassword(data.email, data.password).then(() => {
        if (is.current) {
          setState(prevState => ({
            ...prevState,
            loading: false,
            redirectToReferrer: true
          }));
        }
			}).catch(err => {
        if (is.current) {
          setState(prevState => ({
            ...prevState,
            authError: handleFirestoreError(err),
            loading: false
          }));
        }
			});
		}
	};
  
  const onClickShowPassword = () => {
    if (is.current) {
      setState(prevState => ({ ...prevState, showPassword: !prevState.showPassword }));
    }
  };

  const onMouseDownPassword = e => e.preventDefault();

  const { from } = { from: { pathname: '/' } };

  if (redirectToReferrer) return <Redirect to={from} />

  return (
    <div id="loginFormComponent" ref={is}>
      {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      <SocialAuth openSnackbar={openSnackbar} />

      <div className="light-text pad-v-xs">
        <small>Effettuando il login confermi la presa visione della <Link to="/privacy">privacy</Link> di {app.name}</small>
      </div>

      <form onSubmit={onSubmit} noValidate>
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
              onChange={onChange}
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
              onChange={onChange}
              error={Boolean(errors.password)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={onClickShowPassword}
                    onMouseDown={onMouseDownPassword}>
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
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Accedi</button>
        </div>
      </form>
    </div>
  );
}

LoginForm.propTypes = {
  location: locationType,
  openSnackbar: funcType.isRequired
}

LoginForm.defaultProps = {
  location: null
}
 
export default LoginForm;