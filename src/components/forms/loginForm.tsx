import { FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import React, { ChangeEvent, FC, FormEvent, MouseEvent, useEffect, useState } from 'react';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
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

interface LoginFormProps {
  location: RouteComponentProps['location'];
}

interface ErrorsModel {
  email?: string;
  password?: string;
}

interface StateModel {
  email: string;
  password: string;
  loading: boolean;
  errors: ErrorsModel;
  authError: string;
  redirectToReferrer: boolean;
  showPassword: boolean;
}

const initialState: StateModel = {
  email: '',
  password: '',
  loading: false,
  errors: {},
  authError: '',
  redirectToReferrer: false,
  showPassword: false,
};

const LoginForm: FC<LoginFormProps> = ({ location }: LoginFormProps) => {
  const [email, setEmail] = useState<string>(initialState.email);
  const [password, setPassword] = useState<string>(initialState.password);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [errors, setErrors] = useState<ErrorsModel>(initialState.errors);
  const [authError, setAuthError] = useState<string>(initialState.authError);
  const [redirectToReferrer, setRedirectToReferrer] = useState<boolean>(initialState.redirectToReferrer);
  const [showPassword, setShowPassword] = useState<boolean>(initialState.showPassword);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email: string | null = params.get('email');
    
    if (email) {
      setEmail(email);
    }
  }, [location.search]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    switch (name) {
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      default: break;
    }
    setErrors({ ...errors, [name]: undefined });
  };
  
  const validate = (data: {
    email: string;
    password: string;
  }): ErrorsModel => {
    const errors: ErrorsModel = {};

    if (!data.email) {
      errors.email = 'Inserisci un indirizzo email';
    } else if (data.email.length > max.chars.email) {
      errors.email = `Massimo ${max.chars.email} caratteri`;
    } else if (!isEmail(data.email)) {
      errors.email = 'Email non valida';
    }

    if (data.password) {
      if (data.password.length < min.chars.password) {
        errors.password = `Minimo ${min.chars.password} caratteri`;
      } else if (data.password.length > max.chars.password) {
        errors.password = `Massimo ${max.chars.password} caratteri`;
      }
    } else errors.password = 'Inserisci una password';
    
    return errors;
  };

  const onSubmit = (e: MouseEvent | FormEvent): void => {
    e.preventDefault();
    const errors: ErrorsModel = validate({ email, password });
    
    setAuthError('');
    setErrors(errors);
    
    if (!Object.values(errors).some(Boolean)) {
      setLoading(true);
      auth.signInWithEmailAndPassword(email, password).then((): void => {
        setRedirectToReferrer(true);
      }).catch((err: FirestoreError): void => {
        setAuthError(handleFirestoreError(err));
      }).finally((): void => {
        setLoading(false);
      });
    }
  };
  
  const onTogglePassword = (): void => setShowPassword(showPassword => !showPassword);

  const onMouseDownPassword = (e: MouseEvent<HTMLButtonElement>): void => e.preventDefault();

  const { from } = { from: { pathname: '/' } };

  if (redirectToReferrer) return (
    <Redirect to={from} />
  );

  return (
    <div id='loginFormComponent'>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <SocialAuth />

      <div className='light-text pad-v-xs'>
        <small>Effettuando il login confermi la presa visione della <Link to='/privacy'>privacy</Link> di {app.name}</small>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.email)} htmlFor='email'>Email</InputLabel>
            <Input
              id='email'
              name='email'
              type='email'
              autoFocus
              placeholder='esempio@esempio.com'
              value={email}
              onChange={onChange}
              error={Boolean(errors.email)}
            />
            {errors.email && <FormHelperText className='message error'>{errors.email}</FormHelperText>}
          </FormControl>
        </div>

        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.password)} htmlFor='password'>Password</InputLabel>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Almeno 8 caratteri'
              value={password}
              onChange={onChange}
              error={Boolean(errors.password)}
              endAdornment={(
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={onTogglePassword}
                    onMouseDown={onMouseDownPassword}>
                    {showPassword ? icon.eye : icon.eyeOff}
                  </IconButton>
                </InputAdornment>
              )}
            />
            {errors.password && <FormHelperText className='message error'>{errors.password}</FormHelperText>}
          </FormControl>
        </div>

        {authError && (
          <div className='row'>
            <div className='col message error'>{authError}</div>
          </div>
        )}

        <div className='footer no-gutter'>
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Accedi</button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;