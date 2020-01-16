import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { noteRef, notesRef } from '../../config/firebase';
import { noteTypes } from '../../config/lists';
import { funcType, stringType } from '../../config/types';
import UserContext from '../../context/userContext';
import SnackbarContext from '../../context/snackbarContext';
import Overlay from '../overlay';

const max = {
  chars: {
    text: 280,
    password: 50
  }
};

const min = {
  chars: { text: 10 }
};

const NoteForm = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { nid, onToggle, uid } = props;
  const [data, setData] = useState({
    text: ''
  });
  const [changes, setChanges] = useState(false);
  const [leftChars, setLeftChars] = useState({ text: null });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const is = useRef(true);

  const fetch = useCallback(() => {
    if (nid && uid) {
      if (is.current) setLoading(true);
      
      noteRef(uid, nid).get().then(snap => {
        if (!snap.empty) {
          if (is.current) {
            setData(snap.data());
            setLoading(false);
          }
        }
      }).catch(err => console.warn(err));
    }
  }, [nid, uid]);

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

  const validate = data => {
    const errors = {};
    
    if (!data.text) { 
      errors.text = "Inserisci il testo"; 
    } else if (data.text && data.text.length > max.chars.text) {
      errors.text = `Lunghezza massima ${max.chars.text} caratteri`;
    } else if (data.text && data.text.length < min.chars.text) {
      errors.text = `Lunghezza minima ${min.chars.text} caratteri`;
    }
    if (!data.tag) { 
      errors.tag = "Scegli un tag"; 
    }
		return errors;
	};

	const onSubmit = e => {
    e.preventDefault();

    if (changes) {
      if (is.current) setLoading(true);
      const errors = validate(data);
      
      if (is.current) setErrors(errors);
      
      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);
        
        // console.log(`Sending notification to ${uid}`);
        const newNoteRef = notesRef(uid).doc();
        const ref = nid ? noteRef(uid, nid) : newNoteRef;
        // if (!nid) { notesRef(uid).set({ count: 0 }) }
        ref.set({
          nid: nid || newNoteRef.id,
          text: data.text,
          created_num: Date.now(),
          createdBy: user.displayName,
          createdByUid: user.uid,
          tag: data.tag,
          read: false,
          uid
        }).then(() => {
          onToggle();
          if (is.current) {
            setLoading(false);
            setData({ ...data, text: '' });
          }
          openSnackbar(nid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(err => console.warn(err));
      } else if (is.current) setLoading(false);
    } else onToggle();
	};

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const menuItemsMap = (arr, values) => arr.map(item => 
    <MenuItem 
      value={item} 
      key={item} 
      // insetChildren={Boolean(values)} 
      checked={values ? values.includes(item) : false}>
      {item}
    </MenuItem>
  );

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new note" className="dialog light">
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.text)} htmlFor="text">Testo della notifica</InputLabel>
                <Input
                  id="text"
                  name="text"
                  type="text"
                  autoFocus
                  placeholder={`Inserisci il testo (max ${max.chars.text} caratteri)...`}
                  value={data.text}
                  onChange={onChangeMaxChars}
                  rowsMax={8}
                  multiline
                  error={Boolean(errors.text)}
                />
                {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                {(leftChars.text !== null) && 
                  <FormHelperText className={`message ${(leftChars.text < 0) ? 'warning' : 'neutral'}`}>
                    Caratteri rimanenti: {leftChars.text}
                  </FormHelperText>
                }
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="form-group col">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.tag)} htmlFor="tag">Tag</InputLabel>
                <Select
                  id="tag"
                  error={Boolean(errors.tag)}
                  value={data.tag || []}
                  onChange={onChangeSelect("tag")}
                  multiple>
                  {menuItemsMap(noteTypes, data.tag)}
                </Select>
                {errors.tag && <FormHelperText className="message error">{errors.tag}</FormHelperText>}
              </FormControl>
            </div>
          </div>
        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </>
  );
}

NoteForm.propTypes = {
  onToggle: funcType.isRequired,
  nid: stringType,
  uid: stringType.isRequired
}

NoteForm.defaultProps = {
  nid: null
}
 
export default NoteForm;