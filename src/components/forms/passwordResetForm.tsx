import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import SnackbarContext from '../../context/snackbarContext';

interface ErrorsModel {
  email?: string;
}

interface StateModel {
  email: string;
  emailSent: boolean;
  loading: boolean;
  authError: string;
  errors: ErrorsModel;
}

const initialState: StateModel = {
  email: '',
  emailSent: false,
  loading: false,
  authError: '',
  errors: {},
};

const PasswordResetForm: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [email, setEmail] = useState<string>(initialState.email);
  const [emailSent, setEmailSent] = useState<boolean>(initialState.emailSent);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [authError, setAuthError] = useState(initialState.authError);
  const [errors, setErrors] = useState(initialState.errors);

  const { t } = useTranslation(['form']);

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    setEmail(value); 
    setErrors({ ...errors, [name]: '' });
  };
  
  const validate = (): ErrorsModel => {
    const errors: ErrorsModel = {};
    
    if (email) {
      if (!isEmail(email)) errors.email = t('ERROR_INVALID_FORMAT');
    } else {
      errors.email = t('ERROR_REQUIRED_FIELD');
    }
    return errors;
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const errors = validate();

    setErrors(errors);

    if (!Object.values(errors).some(Boolean)) {
      setLoading(true);
      
      auth.sendPasswordResetEmail(email).then((): void => {
        setEmailSent(true);
        openSnackbar('Ti abbiamo inviato un\'email per reimpostare la password.', 'success');
      }).catch((err: Error): void => {
        setAuthError(String(err));
      }).finally((): void => {
        setLoading(false);
      });
    }
  };

  return (
    <div className='card-container pad-v' id='passwordResetFormComponent'>
      <h2>{t('common:PAGE_RECOVERY_PASSWORD')}</h2>
      <div className='card light'>
        <form noValidate>
          <div className='form-group'>
            <FormControl className='input-field' margin='normal' fullWidth>
              <InputLabel error={Boolean(errors.email)} htmlFor='email'>Email</InputLabel>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder={t('PLACEHOLDER_EG_STRING', { string: 'email@provider.com' })}
                value={email}
                onChange={onChange}
                error={Boolean(errors.email)}
              />
              {errors.email && <FormHelperText className='message error'>{errors.email}</FormHelperText>}
            </FormControl>
          </div>
          
          {authError && <div className='row'><div className='col message error'>{authError}</div></div>}

          <div className='footer no-gutter'>
            {emailSent ? (
              <span className='btn btn-footer success'>
                {t('common:EMAIL_SENT')}
              </span>
            ) : (
              <button type='button' className='btn btn-footer primary' onClick={onSubmit}>
                {t('common:ACTION_RECOVER_PASSWORD')}
              </button>
            )}
          </div>
        </form>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      </div>
    </div>
  );
};
 
export default PasswordResetForm;