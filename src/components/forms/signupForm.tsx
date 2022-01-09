import { ActionCodeSettings, User, UserCredential } from '@firebase/auth-types';
import { FirestoreError } from '@firebase/firestore-types';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import React, { ChangeEvent, CSSProperties, FC, FormEvent, Fragment, MouseEvent, useContext, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import { RolesModel, StatsModel } from '../../types';
import SocialAuth from '../socialAuth';

const labelStyle: CSSProperties = { marginRight: 0, };
const formStyle: CSSProperties = { marginTop: 20, };

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

const roles: RolesModel = {
  admin: false,
  author: false,
  editor: true,
  premium: false
};

const stats: StatsModel = {
  ratings_num: 0,
  reviews_num: 0,
  shelf_num: 0,
  wishlist_num: 0
};

interface DataModel {
  displayName: string;
  email: string;
  password: string;
}

interface ErrorsModel {
  displayName: string;
  email: string;
  password: string;
  terms: string;
}

interface StateModel {
  authError: string;
  data: DataModel;
  errors: ErrorsModel;
  loading: boolean;
  redirectTo: string;
  showPassword: boolean;
  terms: boolean;
}

const initialState: StateModel = {
  authError: '',
  data: {
    displayName: '',
    email: '',
    password: ''
  },
  errors: {
    displayName: '',
    email: '',
    password: '',
    terms: '',
  },
  loading: false,
  redirectTo: '',
  showPassword: false,
  terms: false,
};

const SignupForm: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [terms, setTerms] = useState<boolean>(initialState.terms);
  const [data, setData] = useState<DataModel>(initialState.data);
  const [authError, setAuthError] = useState<string>(initialState.authError);
  const [errors, setErrors] = useState<ErrorsModel>(initialState.errors);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [redirectTo, setRedirectTo] = useState<string>(initialState.redirectTo);
  const [showPassword, setShowPassword] = useState<boolean>(initialState.showPassword);

  const onToggleTerms = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { checked } = e.target;

    setTerms(checked);
    setErrors(errors => ({ ...errors, terms: '' }));
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    setData(data => ({ ...data, [name]: value }));
    setErrors(errors => ({ ...errors, [name]: '' }));
  };
  
  const validate = (): ErrorsModel => {
    const errors: ErrorsModel = {
      displayName: '',
      email: '',
      password: '',
      terms: '',
    };
    
    if (!terms) {
      errors.terms = 'Spunta la casella obbligatoria'; 
    }

    const name: string = data.displayName.toLowerCase();

    if (!data.displayName) { 
      errors.displayName = 'Inserisci un nome utente'; 
    } else if (name === 'admin' || name === 'amministratore' || name.startsWith('biblo')) {
      errors.displayName = 'Nome utente non permesso'; 
      // TODO: check further forbidden names
    } else if (data.displayName.length > max.chars.displayName) {
      errors.displayName = `Massimo ${max.chars.displayName} caratteri`;
    }

    if (!data.email) {
      errors.email = 'Inserisci un indirizzo email';
    } else if (!isEmail(data.email)) {
      errors.email = 'Email non valida';
    } else if (data.email.length > max.chars.email) {
      errors.password = `Massimo ${max.chars.email} caratteri`;
    }

    if (!data.password) {
      errors.password = 'Inserisci una password'; 
    } else if (data.password.length < min.chars.password) {
      errors.password = `Minimo ${min.chars.password} caratteri`;
    } else if (data.password.length > max.chars.password) {
      errors.password = `Massimo ${max.chars.password} caratteri`;
    } // TODO: check password strength

    return errors;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement | HTMLButtonElement>): void => {
    e.preventDefault();
    const errors = validate();
    
    setAuthError(initialState.authError);
    setErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      auth.createUserWithEmailAndPassword(data.email, data.password).then((userCredential: UserCredential) => {
        if (!userCredential) {
          setAuthError('User credentials not available');
        }
      }).catch((err: FirestoreError): void => {
        setAuthError(handleFirestoreError(err));
      }).finally(() => {
        setLoading(false);
      });

      auth.onAuthStateChanged((user: User | null): void => {
        if (user) {
          const {
            displayName,
            email,
            metadata,
            photoURL = '',
            uid,
          } = user;
          const timestamp = metadata.creationTime ? Number((new Date(metadata.creationTime)).getTime()) : -1;
          userRef(uid).set({
            creationTime: timestamp,
            displayName,
            email,
            photoURL,
            roles,
            stats,
            termsAgreement: timestamp, 
            privacyAgreement: timestamp,
            uid,
          }).then().catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        }
      });

      auth.onIdTokenChanged((user: User | null): void => {
        if (user) {
          if (user.emailVerified === false) {
            if (auth.currentUser) {
              const actionCodeSettings: ActionCodeSettings = {
                url: `${app.url}/login/?email=${auth.currentUser.email}`
              };
              user.sendEmailVerification(actionCodeSettings).then(() => {
                setRedirectTo('/verify-email');
              }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
            }
          }
        }
      });
    }
  };

  if (redirectTo) return (
    <Redirect to={redirectTo} />
  );

  return (
    <Fragment>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <FormControlLabel 
        className='text-left' 
        style={labelStyle}
        // required
        label={(
          <span className='text-sm'>
            Accetto i <Link to='/terms'>termini</Link> e confermo la visione della <Link to='/privacy'>privacy</Link> di {app.name}
          </span>
        )}
        control={(
          <Checkbox
            checked={terms}
            onChange={onToggleTerms}
            name='terms'
          />
        )}
      />
      {errors.terms && <FormHelperText className='message error'>{icon.arrowUp} {errors.terms}</FormHelperText>}
      
      <form onSubmit={onSubmit} noValidate style={formStyle}>
        <SocialAuth disabled={!terms} />
        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.displayName)} htmlFor='displayName'>Nome e cognome</InputLabel>
            <Input
              id='displayName'
              name='displayName'
              type='text'
              autoFocus
              placeholder='Mario Rossi'
              value={data.displayName}
              onChange={onChange}
              error={Boolean(errors.displayName)}
            />
            {errors.displayName && <FormHelperText className='message error'>{errors.displayName}</FormHelperText>}
          </FormControl>
        </div>

        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.email)} htmlFor='email'>Email</InputLabel>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='esempio@esempio.com'
              value={data.email}
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
              value={data.password}
              onChange={onChange}
              error={Boolean(errors.password)}
              endAdornment={(
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={(): void => setShowPassword(showPassword => !showPassword)}
                    onMouseDown={(e: MouseEvent): void => e.preventDefault()}>
                    {showPassword ? icon.eye : icon.eyeOff}
                  </IconButton>
                </InputAdornment>
              )}
            />
            {errors.password && <FormHelperText className='message error'>{errors.password}</FormHelperText>}
          </FormControl>
        </div>

        {authError && <div className='row'><div className='col message error'>{authError}</div></div>}

        <div className='footer no-gutter'>
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Registrati</button>
        </div>
      </form>
    </Fragment>
  );
};
 
export default SignupForm;