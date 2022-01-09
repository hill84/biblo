import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import classnames from 'classnames';
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import { Redirect } from 'react-router-dom';
import { groupRef, groupsRef } from '../../config/firebase';
import { funcType, stringType } from '../../config/proptypes';
import { capitalize, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';

const max = {
  chars: {
    title: 100,
    description: 1000,
    rules: 1000
  }
};

const min = {
  chars: {
    title: 3,
    description: 25,
  }
};

const GroupForm = ({ id, onCreated, onToggle, title }) => {
  const { isAdmin, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState({
    title,
    description: '',
    edit: true,
    rules: '',
    type: 'public',
    location: '',
    photoURL: ''
  });
  const [leftChars, setLeftChars] = useState({ description: null, rules: null });
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(Boolean(title));
  const [errors, setErrors] = useState({});
  const [redirectToReferrer, setRedirectToReferrer] = useState(null);
  const is = useRef(true);

  const fetch = useCallback(() => {
    if (!id) return;
    if (is.current) setLoading(true);

    groupRef(id).get().then(snap => {
      if (!snap.empty && is.current) {
        setData(snap.data());
      }
    }).catch(err => {
      console.warn(err);
    }).finally(() => {
      if (is.current) setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;

    if (is.current) {
      setChanges(true);
      setData({ ...data, [name]: value }); 
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;

    if (is.current) {
      setChanges(true);
      setData({ ...data, [name]: value });
      setLeftChars({ ...leftChars, [name]: max.chars[name] - value.length });
      setErrors({ ...errors, [name]: null });
    }
  };

  const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (is.current) {
      setChanges(true);
      setData({ ...data, [name]: value });
      setErrors({ ...errors, [name]: null });
    }
  };

  const checkTitle = async title => {
    const result = await groupsRef.where('title', '==', title).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  };

  const validate = async data => {
    const errors = {};
    const isDuplicate = id ? false : await checkTitle(data.title);

    if (!data.title) { 
      errors.title = 'Inserisci il titolo'; 
    } else if (isDuplicate) {
      errors.title = 'Gruppo già presente';
    } else if (data.title?.length > max.chars.title) {
      errors.title = `Massimo ${max.chars.title} caratteri`;
    } else if (data.title?.length < min.chars.title) {
      errors.title = `Minimo ${min.chars.title} caratteri`;
    }
    if (!data.description) { 
      errors.description = 'Inserisci una descrizione'; 
    } else if (data.description?.length > max.chars.description) {
      errors.description = `Massimo ${max.chars.description} caratteri`;
    } else if (data.description?.length < min.chars.description) {
      errors.description = `Minimo ${min.chars.description} caratteri`;
    }
    if (data.rules?.length > max.chars.rules) {
      errors.rules = `Massimo ${max.chars.rules} caratteri`;
    }
    return errors;
  };
  
  const onSubmit = async e => {
    e.preventDefault();

    if (changes) {
      if (is.current) setLoading(true);
      const errors = await validate(data);
      
      if (is.current) setErrors(errors);
      
      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);
        const ref = id ? groupRef(id) : groupsRef.doc();
        ref.set({
          gid: id || ref.id,
          edit: data.edit,
          title: capitalize(data.title) || '',
          description: data.description || '',
          rules: data.rules || '',
          photoURL: data.photoURL || '',
          followers_num: data.followers_num || 0,
          type: data.type || 'public',
          location: data.location || '',
          created_num: data.created_num || Date.now(),
          owner: data.owner || user.displayName,
          ownerUid: data.ownerUid || user.uid,
          lastEdit_num: Date.now(),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          moderators: data.moderators || [data.ownerUid || user.uid]
        }).then(() => {
          if (id) {
            onCreated?.();
            onToggle();
            openSnackbar(data.title ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
          } else {
            setRedirectToReferrer(ref.id);
          }
        }).catch(err => {
          console.warn(err);
        }).finally(() => {
          if (is.current) setLoading(false);
        });
      } else if (is.current) setLoading(false);
    } else onToggle();
  };
  
  if (redirectToReferrer) return <Redirect to={`group/${redirectToReferrer}`} />;

  return (
    <Fragment>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new group" className="dialog light" ref={is}>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.title)} htmlFor="title">Nome del gruppo*</InputLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  autoFocus
                  placeholder="Es: Il mio gruppo"
                  value={data.title}
                  onChange={onChange}
                  error={Boolean(errors.title)}
                />
                {errors.title && <FormHelperText className="message error">{errors.title}</FormHelperText>}
              </FormControl>
            </div>
            {isAdmin && (
              <div className="form-group col col-sm-3">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.type)} htmlFor="type">Tipo</InputLabel>
                  <Select
                    id="type"
                    value={data.type}
                    onChange={onChangeSelect('type')}
                    error={Boolean(errors.type)}>
                    <MenuItem value="public">Pubblico</MenuItem>
                    <MenuItem value="private">Privato</MenuItem>
                  </Select>
                  {errors.type && <FormHelperText className="message error">{errors.type}</FormHelperText>}
                </FormControl>
              </div>
            )}
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.description)} htmlFor="description">Descrizione*</InputLabel>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder={`Inserisci la descrizione (max ${max.chars.description} caratteri)...`}
                  value={data.description}
                  onChange={onChangeMaxChars}
                  rowsMax={20}
                  multiline
                  error={Boolean(errors.description)}
                />
                {errors.description && <FormHelperText className="message error">{errors.description}</FormHelperText>}
                {(leftChars.description !== null) && (
                  <FormHelperText className={classnames('message', leftChars.description < 0 ? 'warning' : 'neutral')}>
                    Caratteri rimanenti: {leftChars.description}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.rules)} htmlFor="rules">Regole</InputLabel>
                <Input
                  id="rules"
                  name="rules"
                  type="text"
                  placeholder={`Inserisci la descrizione (max ${max.chars.rules} caratteri)...`}
                  value={data.rules}
                  onChange={onChangeMaxChars}
                  rowsMax={20}
                  multiline
                  error={Boolean(errors.rules)}
                />
                {errors.rules && <FormHelperText className="message error">{errors.rules}</FormHelperText>}
                {(leftChars.rules !== null) && 
                  <FormHelperText className={classnames('message', leftChars.rules < 0 ? 'warning' : 'neutral')}>
                    Caratteri rimanenti: {leftChars.rules}
                  </FormHelperText>
                }
              </FormControl>
            </div>
          </div>
          
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.location)} htmlFor="location">Località</InputLabel>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Es: Torino"
                  value={data.location}
                  onChange={onChange}
                  error={Boolean(errors.location)}
                />
                {errors.location && <FormHelperText className="message error">{errors.location}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div className="row">
            {data.photoURL && (
              <div className="col-auto">
                <Avatar className="image avatar prepend-input">
                  <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                    <img alt="avatar" src={data.photoURL} className="avatar thumb" />
                  </Zoom>
                </Avatar>
              </div>
            )}
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.photoURL)} htmlFor="photoURL">URL foto</InputLabel>
                <Input
                  id="photoURL"
                  name="photoURL"
                  type="text"
                  placeholder="Es: https://firebasestorage.googleapis.com/.../groups%2Fgroup.jpg"
                  value={data.photoURL}
                  onChange={onChange}
                  error={Boolean(errors.photoURL)}
                />
                {errors.photoURL && <FormHelperText className="message error">{errors.photoURL}</FormHelperText>}
              </FormControl>
            </div>
          </div>

        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </Fragment>
  );
};

GroupForm.propTypes = {
  id: stringType,
  onCreated: funcType,
  onToggle: funcType.isRequired,
  title: stringType,
};

GroupForm.defaultProps = {
  id: null,
  title: '',
};
 
export default GroupForm;