import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useContext, useEffect, useRef, useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import { auth } from '../../config/firebase';
import { handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';

const PasswordResetForm = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [errors, setErrors] = useState({});
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;

    if (is.current) {
      setEmail(value); 
      setErrors({ ...errors, [name]: null });
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

    if (is.current) setErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (is.current) setLoading(true);
      
      auth.sendPasswordResetEmail(email).then(() => {
        if (is.current) {
          setEmailSent(true);
          setLoading(false);
        }
        openSnackbar(`Ti abbiamo inviato un'email per reimpostare la password.`, 'success');
      }).catch(err => {
        if (is.current) {
          setAuthError(handleFirestoreError(err));
          setLoading(false);
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
 
export default PasswordResetForm;