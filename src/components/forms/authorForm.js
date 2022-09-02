import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import { authorRef, authorsRef } from '../../config/firebase';
import { funcType, stringType } from '../../config/proptypes';
import { handleFirestoreError, normalizeString } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';

const max = { chars: {
  bio: 1000,
  displayName: 50
}};
const min = { chars: { 
  bio: 50 
}};

const AuthorForm = ({ id, onToggle }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState({
    displayName: '',
    source: '',
    sex: '',
    photoURL: '',
    bio: ''
  });
  const [leftChars, setLeftChars] = useState({ bio: null });
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const [errors, setErrors] = useState({});

  const { t } = useTranslation(['form']);

  const is = useRef(true);

  const fetch = useCallback(() => {
    if (id) {
      if (is.current) setLoading(true);

      authorRef(id).get().then(snap => {
        if (!snap.empty && is.current) {
          setData(snap.data());
        }
      }).catch(err => {
        console.warn(err);
      }).finally(() => {
        if (is.current) setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch, id]);

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

  const checkDisplayName = async displayName => {
    const result = await authorsRef.where('displayName', '==', displayName).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  };

  const validate = async data => {
    const errors = {};
    const isDuplicate = id ? false : await checkDisplayName(data.displayName);

    if (!data.displayName) { 
      errors.displayName = t('ERROR_REQUIRED_FIELD'); 
    } else if (isDuplicate) {
      errors.displayName = t('ERROR_DUPLICATED_ITEM');
    } else if (data.displayName?.length > max.chars.displayName) {
      errors.displayName = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.displayName });
    }
    if (!data.sex) {
      errors.sex = t('ERROR_REQUIRED_FIELD');
    }
    if (!data.bio) { 
      errors.bio = t('ERROR_REQUIRED_FIELD'); 
    } else if (data.bio?.length > max.chars.bio) {
      errors.bio = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.bio });
    } else if (data.bio?.length < min.chars.bio) {
      errors.bio = t('ERROR_MIN_COUNT_CHARACTERS', { count: max.chars.bio });
    }
    return errors;
  };
  
  const onSubmit = async e => {
    e.preventDefault();

    if (changes) {
      if (is.current) setLoading(true);
      const errors = await validate(data);
      
      if (is.current) setErrors(errors);
      
      if (!Object.values(errors).some(Boolean)) {
        if (is.current) setLoading(true);
        const ref = data.displayName ? authorRef(normalizeString(data.displayName)) : authorsRef.doc();
        ref.set({
          bio: data.bio || '',
          displayName: data.displayName || '',
          edit: data.edit || true,
          // followers: data.followers || {},
          lastEdit_num: Date.now(),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          photoURL: data.photoURL || '',
          sex: data.sex || '',
          source: data.source || ''
        }).then(() => {
          onToggle();
          if (is.current) setLoading(false);
          openSnackbar(t(data.displayName ? 'CHANGES_SAVED' : 'SUCCESS_ITEM_CREATED'), 'success');
        }).catch(err => console.warn(err));
      } else if (is.current) setLoading(false);
    } else onToggle();
  };

  return (
    <Fragment>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new author" className="dialog light" ref={is}>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.displayName)} htmlFor="displayName">
                  {t('LABEL_DISPLAY_NAME')}
                </InputLabel>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoFocus
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'George Orwell' })}
                  value={data.displayName}
                  onChange={onChange}
                  error={Boolean(errors.displayName)}
                />
                {errors.displayName && (
                  <FormHelperText className="message error">{errors.displayName}</FormHelperText>
                )}
              </FormControl>
            </div>
            <div className="form-group col col-sm-3">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.sex)} htmlFor="sex">
                  {t('LABEL_SEX')}
                </InputLabel>
                <Select
                  id="sex"
                  value={data.sex}
                  onChange={onChangeSelect('sex')}
                  error={Boolean(errors.sex)}>
                  <MenuItem key="m" value="m">{t('common:SEX_M')}</MenuItem>
                  <MenuItem key="f" value="f">{t('common:SEX_F')}</MenuItem>
                  <MenuItem key="x" value="x">{t('common:SEX_X')}</MenuItem>
                </Select>
                {errors.sex && (
                  <FormHelperText className="message error">{errors.sex}</FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.bio)} htmlFor="bio">
                  {t('LABEL_BIOGRAPHY')}
                </InputLabel>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.bio })}
                  value={data.bio}
                  onChange={onChangeMaxChars}
                  maxRows={20}
                  multiline
                  error={Boolean(errors.bio)}
                />
                {errors.bio && (
                  <FormHelperText className="message error">{errors.bio}</FormHelperText>
                )}
                {(leftChars.bio !== null) && (
                  <FormHelperText className={`message ${leftChars.bio < 0 ? 'warning' : 'neutral'}`}>
                    {t('REMAINING_CHARACTERS')}: {leftChars.bio}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>
          
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.source)} htmlFor="source">
                  {t('LABEL_SOURCE_URL')}
                </InputLabel>
                <Input
                  id="source"
                  name="source"
                  type="text"
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'George Orwell' })}
                  value={data.source}
                  onChange={onChange}
                  error={Boolean(errors.source)}
                />
                {errors.source && (
                  <FormHelperText className="message error">{errors.source}</FormHelperText>
                )}
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
                <InputLabel error={Boolean(errors.photoURL)} htmlFor="photoURL">
                  {t('LABEL_IMAGE_URL')}
                </InputLabel>
                <Input
                  id="photoURL"
                  name="photoURL"
                  type="text"
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'https://firebasestorage.googleapis.com/.../authors%2Fauthor.jpg' })}
                  value={data.photoURL}
                  onChange={onChange}
                  error={Boolean(errors.photoURL)}
                />
                {errors.photoURL && (
                  <FormHelperText className="message error">{errors.photoURL}</FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>
            {t('common:ACTION_SAVE')}
          </button>
        </div>
      </div>
    </Fragment>
  );
};

AuthorForm.propTypes = {
  onToggle: funcType.isRequired,
  id: stringType
};

AuthorForm.defaultProps = {
  id: null
};
 
export default AuthorForm;