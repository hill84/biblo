import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { authorRef, authorsRef } from '../../config/firebase';
import { getInitials, handleFirestoreError, normalizeString } from '../../config/shared';
import { funcType, stringType, userType } from '../../config/types';
import Overlay from '../overlay';

const avatarImgStyle = { width: '100%', height: '100%', };

const AuthorForm = props => {
  const [state, setState] = useState({
    data: {
      displayName: '',
      source: '',
      sex: '',
      photoURL: '',
      bio: ''
    },
    bio_leftChars: null,
    bio_maxChars: 1000,
    bio_minChars: 50,
    loading: false,
    changes: false,
    errors: {},
    authError: ''
  });

  const is = useRef(true);
  const { id, openSnackbar, user } = props;
  const { authError, bio_leftChars, bio_maxChars, bio_minChars, changes, data, errors, loading, selectedId } = state;

  const fetch = useCallback(() => {
    if (typeof id === 'string') {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));

      authorRef(id).get().then(snap => {
        if (!snap.empty) {
          if (is.current) {
            setState(prevState => ({
              ...prevState,
              data: snap.data(),
              loading: false
            }));
          }
        }
      }).catch(err => console.warn(err));
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch, id]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onToggle = () => props.onToggle(selectedId);

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;

    if (is.current) {
      setState(prevState => ({
        ...prevState,
        changes: true,
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };
  
  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    const leftChars = `${name}_leftChars`;
    const maxChars = `${name}_maxChars`;

    if (is.current) {
      setState(prevState => ({
        ...prevState,
        data: { ...prevState.data, [name]: value }, 
        [leftChars]: prevState[maxChars] - value.length, 
        changes: true
      }));
    }
  };

  const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (is.current) {
      setState(prevState => ({
        ...prevState,
        changes: true,
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null } 
      }));
    }
  };

  const checkDisplayName = async displayName => {
    const result = await authorsRef.where('displayName', '==', displayName).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }

	const validate = async data => {
    const errors = {};
    const isDuplicate = id ? false : await checkDisplayName(data.displayName);

    if (!data.displayName) { 
      errors.displayName = "Inserisci il nominativo"; 
    } else if (isDuplicate) {
      errors.displayName = "Autore già presente";
    }
    if (!data.sex) {
      errors.sex = "Sesso mancante";
    }
    if (!data.bio) { 
      errors.bio = "Inserisci una biografia"; 
    } else if (data.bio && data.bio.length > bio_maxChars) {
      errors.bio = `Lunghezza massima ${bio_maxChars} caratteri`;
    } else if (data.bio && data.bio.length < bio_minChars) {
      errors.bio = `Lunghezza minima ${bio_minChars} caratteri`;
    }
		return errors;
  };
  
	const onSubmit = async e => {
    e.preventDefault();
    const prevState = state;

    if (changes) {
      const errors = await validate(prevState.data);
      
      if (is.current) setState(prevState => ({ ...prevState, authError: '', errors }));
      
      if (Object.keys(errors).length === 0) {
        if (is.current) setState(prevState => ({ ...prevState, loading: true }));
        const ref = data.displayName ? authorRef(normalizeString(data.displayName)) : authorsRef.doc();
        ref.set({
          bio: data.bio || '',
          displayName: data.displayName || '',
          edit: data.edit || true,
          // followers: data.followers || {},
          lastEdit_num: Number((new Date()).getTime()),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          photoURL: data.photoURL || '',
          sex: data.sex || '',
          source: data.source || ''
        }).then(() => {
          onToggle();
          if (is.current) setState(prevState => ({ ...prevState, loading: false }));
          openSnackbar(data.displayName ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(err => console.warn(err));
      }
    } else onToggle();
	};

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new author" className="dialog light" ref={is}>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.displayName)} htmlFor="displayName">Nominativo</InputLabel>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoFocus
                  placeholder="Es: George Orwell"
                  value={data.displayName}
                  onChange={onChange}
                  error={Boolean(errors.displayName)}
                />
                {errors.displayName && <FormHelperText className="message error">{errors.displayName}</FormHelperText>}
              </FormControl>
            </div>
            <div className="form-group col col-sm-3">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.sex)} htmlFor="sex">Sesso</InputLabel>
                <Select
                  id="sex"
                  value={data.sex}
                  onChange={onChangeSelect("sex")}
                  error={Boolean(errors.sex)}>
                  <MenuItem key="m" value="m">Uomo</MenuItem>
                  <MenuItem key="f" value="f">Donna</MenuItem>
                  <MenuItem key="x" value="x">Altro</MenuItem>
                </Select>
                {errors.sex && <FormHelperText className="message error">{errors.sex}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.bio)} htmlFor="bio">Biografia</InputLabel>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  placeholder={`Inserisci la biografia (max ${bio_maxChars} caratteri)...`}
                  value={data.bio}
                  onChange={onChangeMaxChars}
                  rowsMax={20}
                  multiline
                  error={Boolean(errors.bio)}
                />
                {errors.bio && <FormHelperText className="message error">{errors.bio}</FormHelperText>}
                {(bio_leftChars !== null) && 
                  <FormHelperText className={`message ${(bio_leftChars < 0) ? 'alert' : 'neutral'}`}>
                    Caratteri rimanenti: {bio_leftChars}
                  </FormHelperText>
                }
              </FormControl>
            </div>
          </div>
          
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.source)} htmlFor="source">URL fonte</InputLabel>
                <Input
                  id="source"
                  name="source"
                  type="text"
                  placeholder="Es: //it.wikipedia.org/wiki/George_Orwell"
                  value={data.source}
                  onChange={onChange}
                  error={Boolean(errors.source)}
                />
                {errors.source && <FormHelperText className="message error">{errors.source}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="col-auto">
              <Avatar className="image avatar prepend-input" alt="Avatar">
                {data.photoURL ? <img src={data.photoURL} alt="avatar" style={avatarImgStyle} /> : getInitials(data.displayName)}
              </Avatar>
            </div>
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.photoURL)} htmlFor="photoURL">URL foto</InputLabel>
                <Input
                  id="photoURL"
                  name="photoURL"
                  type="text"
                  placeholder="Es: //firebasestorage.googleapis.com/.../authors%2Fauthor.jpg"
                  value={data.photoURL}
                  onChange={onChange}
                  error={Boolean(errors.photoURL)}
                />
                {errors.photoURL && <FormHelperText className="message error">{errors.photoURL}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          {authError && <div className="row"><div className="col message error">{authError}</div></div>}
        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </>
  );
}

AuthorForm.propTypes = {
  onToggle: funcType.isRequired,
  openSnackbar: funcType.isRequired,
  id: stringType,
  user: userType
}

AuthorForm.defaultProps = {
  id: null,
  user: null
}
 
export default AuthorForm;