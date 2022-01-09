import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React, { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';
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

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    setEmail(value); 
    setErrors({ ...errors, [name]: '' });
  };
  
  const validate = (): ErrorsModel => {
    const errors: ErrorsModel = {};
    
    if (email) {
      if (!isEmail(email)) errors.email = 'Formato email non valido';
    } else {
      errors.email = 'Inserisci un indirizzo email';
    }
    return errors;
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const errors = validate();

    setErrors(errors);

    if (Object.keys(errors).length === 0) {
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
      <h2>Recupero password</h2>
      <div className='card light'>
        <p>Per favore, inserisci la tua email per recuperare la password.</p>
        <form noValidate>
          <div className='form-group'>
            <FormControl className='input-field' margin='normal' fullWidth>
              <InputLabel error={Boolean(errors.email)} htmlFor='email'>Email</InputLabel>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='esempio@esempio.com'
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
              <span className='btn btn-footer success'>Email inviata</span>
            ) : (
              <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Recupera password</button>
            )}
          </div>
        </form>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      </div>
    </div>
  );
};
 
export default PasswordResetForm;