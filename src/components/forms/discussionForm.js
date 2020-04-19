import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { ThemeProvider } from '@material-ui/styles';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionsRef } from '../../config/firebase';
import { checkBadWords, extractUrls, handleFirestoreError, join } from '../../config/shared';
import { defaultTheme, primaryTheme } from '../../config/themes';
import { stringType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/discussionForm.css';

const max = {
  chars: {
    text: 2000
  }
};

const min = {
  chars: {
    text: 10
  }
};

const formControlStyle = { marginTop: '8px', };

const DiscussionForm = props => {
  const { user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar, snackbarIsOpen } = useContext(SnackbarContext);
  const { gid } = props;
  const authid = useMemo(() => user?.uid, [user]);
  const initialDiscussionState = useMemo(() => ({
    gid,
    createdByUid: authid,
    created_num: 0,
    lastEditByUid: authid,
    lastEdit_num: Date.now(),
    displayName: '',
    photoURL: '',
    text: '',
  }), [authid, gid]);
  const [discussion, setDiscussion] = useState(initialDiscussionState);
  const [leftChars, setLeftChars] = useState({ text: null, title: null });
  const [changes, setChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  useEffect(() => {
    if (!user?.photoURL) {
      const msg = <span>Non hai <span className="hide-sm">ancora caricato</span> una foto profilo.</span>;
      const action = <Link to="/profile" type="button" className="btn sm flat" onClick={closeSnackbar}>Aggiungila</Link>;
      openSnackbar(msg, 'info', 4000, action);
    }
  }, [closeSnackbar, openSnackbar, user]);

  const validate = useCallback(discussion => {
    const { text } = discussion;
    const errors = {};
    const urlMatches = extractUrls(text);
    const badWords = checkBadWords(text);

    if (!text) {
      errors.text = "Aggiungi un commento";
    } else if (text.length > max.chars.text) {
      errors.text = `Massimo ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Minimo ${min.chars.text} caratteri`;
    } else if (urlMatches) {
      errors.text = `Non inserire link esterni (${join(urlMatches)})`;
    } else if (badWords) {
      errors.text = "Niente volgarità";
    }

    return errors;
  }, []);

  const onSubmit = e => {
    e.preventDefault();

    if (changes) {
      const errors = validate(discussion);
      if (is.current) setErrors(errors);

      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);

        if (gid && user) {
          const ref = groupDiscussionsRef(gid).doc();
          const updatedDiscussion = {
            did: ref.id,
            created_num: discussion.created_num || Date.now(),
            displayName: user.displayName,
            lastEditByUid: authid,
            lastEdit_num: Date.now(),
            photoURL: user.photoURL
          };

          ref.set({
            ...discussion,
            ...updatedDiscussion
          }).catch(err => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally(() => {
            if (is.current) {
              setLoading(false);
              setChanges(false);
              setErrors({});
              setDiscussion(initialDiscussionState);
              setLeftChars({ text: null, title: null });
            }
          });
        } else console.warn(`No gid or user`);
      }
    }
  };

  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (is.current) {
      if (snackbarIsOpen) closeSnackbar();
      setDiscussion({ ...discussion, [name]: value });
      setErrors({ ...errors, [name]: null }); 
      setLeftChars({ ...leftChars, [name]: max.chars[name] - value.length });
      setChanges(true);
    } 
  };

  return (
    <form className={`card user-discussion ${discussion?.text ? 'light' : 'primary'}`}>
      {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      <div className="form-group">
        <FormControl className="input-field" margin="dense" fullWidth style={formControlStyle}>
          <ThemeProvider theme={discussion?.text ? defaultTheme : primaryTheme}>
            <InputLabel error={Boolean(errors.text)} htmlFor="text">Il tuo commento</InputLabel>
            <Input
              id="text"
              name="text"
              type="text"
              placeholder={`Scrivi il tuo commento (max ${max.chars.text} caratteri)...`}
              value={discussion.text || ''}
              onChange={onChangeMaxChars}
              error={Boolean(errors.text)}
              multiline
              endAdornment={(
                <button
                  type="button"
                  className={`btn sm counter ${discussion?.text ? 'primary' : 'hidden'}`}
                  style={{ marginTop: '-8px', }}
                  onClick={onSubmit}
                  disabled={!discussion?.text || !changes || loading}>
                  Pubblica
                </button>
              )}
            />
          </ThemeProvider>
          {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
          {leftChars.text < 0 && <FormHelperText className="message warning">Caratteri in eccesso: {-leftChars.text}</FormHelperText>}
        </FormControl>
      </div>
    </form>
  );
}

DiscussionForm.propTypes = {
  gid: stringType.isRequired
}
 
export default DiscussionForm;