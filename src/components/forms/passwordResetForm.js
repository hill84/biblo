import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useEffect, useRef, useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import { handleFirestoreError } from '../../config/shared';
import { funcType } from '../../config/types';

const PasswordResetForm = props => {
  const [state, setState] = useState({
    email: '',
    emailSent: false,
    loading: false,
    authError: null,
    errors: {}
  });

  const is = useRef(true);
  const { openSnackbar } = props;
  const { email, emailSent, loading, authError, errors } = state;

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onChange = e => {
    e.persist();

    if (is.current) {
      setState(prevState => ({ 
        ...prevState,
        email: e.target.value, 
        errors: { ...prevState.errors, [e.target.name]: null } 
      }));
    }
  };
  
  const validate = () => {
    const errors = {};
    
		if (email) {
			if (!isEmail(email)) errors.email = "Formato email non valido";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		return errors;
	};

	const onSubmit = e => {
    e.preventDefault();
    const errors = validate(email);

    if (is.current) setState(prevState => ({ ...prevState, errors }));
    if (Object.keys(errors).length === 0) {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));
      auth.sendPasswordResetEmail(email).then(() => {
        if (is.current) {
          setState(prevState => ({ 
            ...prevState, 
            emailSent: true, 
            loading: false 
          }));
        }
        openSnackbar(`Ti abbiamo inviato un'email per reimpostare la password.`, 'success');
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

  return (
    <div className="card-container pad-v" id="passwordResetFormComponent">
      <h2>Recupero password</h2>
      <div className="card light">
        <p>Per favore, inserisci la tua email per recuperare la password.</p>
        <form noValidate>
          <div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.email)} htmlFor="email">Email</InputLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="esempio@esempio.com"
                value={email}
                onChange={onChange}
                error={Boolean(errors.email)}
              />
              {errors.email && <FormHelperText className="message error">{errors.email}</FormHelperText>}
            </FormControl>
          </div>
          
          {authError && <div className="row"><div className="col message error">{authError}</div></div>}

          <div className="footer no-gutter">
            {emailSent ? (
              <span className="btn btn-footer success">Email inviata</span>
            ) : (
              <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Recupera password</button>
            )}
          </div>
        </form>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      </div>
    </div>
  );
}

PasswordResetForm.propTypes = {
  openSnackbar: funcType.isRequired
}
 
export default PasswordResetForm;