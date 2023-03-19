import type { ActionCodeSettings, User, UserCredential } from '@firebase/auth-types';
import type { FirestoreError } from '@firebase/firestore-types';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import DOMPurify from 'dompurify';
import type { CSSProperties, ChangeEvent, FC, FormEvent, MouseEvent } from 'react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import type { RolesModel, StatsModel } from '../../types';
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

  const { t } = useTranslation(['form']);

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
      errors.terms = t('ERROR_REQUIRED_CHECKBOX'); 
    }

    const name: string = data.displayName.toLowerCase();

    if (!data.displayName) { 
      errors.displayName = t('ERROR_REQUIRED_FIELD'); 
    } else if (name === 'admin' || name === 'amministratore' || name.startsWith('biblo')) {
      errors.displayName = t('ERROR_FORBIDDEN_DISPLAY_NAME'); 
      // TODO: check further forbidden names
    } else if (data.displayName.length > max.chars.displayName) {
      errors.displayName = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.displayName });
    }

    if (!data.email) {
      errors.email = t('ERROR_REQUIRED_FIELD');
    } else if (!isEmail(data.email)) {
      errors.email = t('ERROR_INVALID_FORMAT');
    } else if (data.email.length > max.chars.email) {
      errors.password = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.email });
    }

    if (!data.password) {
      errors.password = t('ERROR_REQUIRED_FIELD'); 
    } else if (data.password.length < min.chars.password) {
      errors.password = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.password });
    } else if (data.password.length > max.chars.password) {
      errors.password = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.password });
    } // TODO: check password strength

    return errors;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement | HTMLButtonElement>): void => {
    e.preventDefault();
    const errors: ErrorsModel = validate();
    
    setAuthError(initialState.authError);
    setErrors(errors);
    
    if (!Object.values(errors).some(Boolean)) {
      setLoading(true);
      auth.createUserWithEmailAndPassword(data.email, data.password).then((userCredential: UserCredential) => {
        if (!userCredential) {
          setAuthError('User credentials not available');
        }
      }).catch((err: FirestoreError): void => {
        setAuthError(handleFirestoreError(err));
      }).finally((): void => {
        setLoading(false);
      });

      auth.onAuthStateChanged((user: User | null): void => {
        if (!user) return;
        const {
          displayName,
          email,
          metadata,
          photoURL = '',
          uid,
        } = user;
        const timestamp: number = metadata.creationTime ? Number((new Date(metadata.creationTime)).getTime()) : -1;
        userRef(uid).set({
          creationTime: timestamp,
          displayName: displayName || data.displayName,
          email,
          photoURL,
          roles,
          stats,
          termsAgreement: timestamp, 
          privacyAgreement: timestamp,
          uid,
        }).then().catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      });

      auth.onIdTokenChanged((user: User | null): void => {
        if (!user || user.emailVerified === true || !auth.currentUser) return;
        const actionCodeSettings: ActionCodeSettings = {
          url: `${app.url}/login/?email=${auth.currentUser.email}`
        };
        user.sendEmailVerification(actionCodeSettings).then(() => {
          setRedirectTo('/verify-email');
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      });
    }
  };

  if (redirectTo) return (
    <Redirect to={redirectTo} />
  );

  return (
    <>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <FormControlLabel 
        className='text-left' 
        style={labelStyle}
        // required
        label={(
          <small dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('common:SIGNUP_PARAGRAPH'))}} />
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
            <InputLabel error={Boolean(errors.displayName)} htmlFor='displayName'>
              {t('LABEL_DISPLAY_NAME')}
            </InputLabel>
            <Input
              id='displayName'
              name='displayName'
              type='text'
              autoFocus
              placeholder={t('PLACEHOLDER_DISPLAY_NAME')}
              value={data.displayName}
              onChange={onChange}
              error={Boolean(errors.displayName)}
            />
            {errors.displayName && <FormHelperText className='message error'>{errors.displayName}</FormHelperText>}
          </FormControl>
        </div>

        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.email)} htmlFor='email'>
              Email
            </InputLabel>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder={t('PLACEHOLDER_EG_STRING', { string: 'email@provider.com' })}
              value={data.email}
              onChange={onChange}
              error={Boolean(errors.email)}
            />
            {errors.email && <FormHelperText className='message error'>{errors.email}</FormHelperText>}
          </FormControl>
        </div>

        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.password)} htmlFor='password'>
              Password
            </InputLabel>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder={t('AT_LEAST_COUNT_CHARACTERS', { count: 8 })}
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
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>
            {t('common:ACTION_SIGNUP')}
          </button>
        </div>
      </form>
    </>
  );
};
 
export default SignupForm;