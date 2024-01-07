import type { FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { sanitize } from 'dompurify';
import type { ChangeEvent, FC, FormEvent, MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RouteComponentProps } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import icon from '../../config/icons';
import { handleFirestoreError } from '../../config/shared';
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

  const { t } = useTranslation(['form', 'common']);

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
      errors.email = t('ERROR_REQUIRED_FIELD');
    } else if (data.email.length > max.chars.email) {
      errors.email = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.email });
    } else if (!isEmail(data.email)) {
      errors.email = t('ERROR_INVALID_FORMAT');
    }

    if (data.password) {
      if (data.password.length < min.chars.password) {
        errors.password = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.password });
      } else if (data.password.length > max.chars.password) {
        errors.password = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.password });
      }
    } else errors.password = t('ERROR_REQUIRED_FIELD');

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
        <small dangerouslySetInnerHTML={{ __html: sanitize(t('common:LOGIN_PARAGRAPH'))}} />
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className='form-group'>
          <FormControl className='input-field' margin='normal' fullWidth>
            <InputLabel error={Boolean(errors.email)} htmlFor='email'>
              Email
            </InputLabel>
            <Input
              id='email'
              name='email'
              type='email'
              autoFocus
              placeholder={t('PLACEHOLDER_EG_STRING', { string: 'email@provider.com' })}
              value={email}
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
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>
            {t('common:ACTION_LOGIN')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;