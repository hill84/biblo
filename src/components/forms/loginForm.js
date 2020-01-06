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

const max = {
  chars: {
    email: 254,
    password: 50
  }
};

const min = {
  chars: { password: 8 }
};

const LoginForm = props => {
  const { location, openSnackbar } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [redirectToReferrer, setRedirectToReferrer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const is = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    
    if (is.currenr && email) {
      setEmail(email);
    }

    return () => {
      is.current = false;
    }
  }, [location.search]);

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;

    switch (name) {
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      default: break;
    }
    setErrors({ ...errors, [name]: null });
  };
  
  const validate = data => {
    const errors = {};
    if (!data.email) {
      errors.email = "Inserisci un indirizzo email";
    } else if (data.email.length > max.chars.email) {
      errors.email = `Massimo ${max.chars.email} caratteri`
    } else if (!isEmail(data.email)) {
      errors.email = "Email non valida";
    }
    if (data.password) {
      if (data.password.length < min.chars.password) {
        errors.password = `Minimo ${min.chars.password} caratteri`;
      } else if (data.password.length > max.chars.password) {
        errors.password = `Massimo ${max.chars.password} caratteri`;
      }
    } else errors.password = "Inserisci una password";
		return errors;
  };

	const onSubmit = e => {
    e.preventDefault();
    const errors = validate({ email, password });
    
    if (is.current) {
      setAuthError('');
      setErrors(errors);
    }
    
		if (Object.keys(errors).length === 0) {
      if (is.current) setLoading(true);
			auth.signInWithEmailAndPassword(email, password).then(() => {
        if (is.current) {
          setLoading(false);
          setRedirectToReferrer(true);
        }
			}).catch(err => {
        if (is.current) {
          setAuthError(handleFirestoreError(err));
          setLoading(false);
        }
			});
		}
	};
  
  const onTogglePassword = () => setShowPassword(!showPassword);

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
              value={email}
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
              value={password}
              onChange={onChange}
              error={Boolean(errors.password)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={onTogglePassword}
                    onMouseDown={onMouseDownPassword}>
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