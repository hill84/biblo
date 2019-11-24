import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { collectionRef, collectionsRef } from '../../config/firebase';
import { genres } from '../../config/lists';
import { handleFirestoreError } from '../../config/shared';
import { funcType, stringType, userType } from '../../config/types';
import Overlay from '../overlay';

const CollectionForm = props => {
  const [state, setState] = useState({
    data: {
      books_num: 0,
      description: '',
      edit: true,
      genres: [],
      title: ''
    },
    desc_leftChars: null,
    desc_maxChars: 1000,
    desc_minChars: 50,
    loading: false,
    changes: false,
    errors: {},
    selectedId: null
  });

  const is = useRef(true);
  const { id, openSnackbar, user } = props;
  const { changes, desc_leftChars, desc_maxChars, desc_minChars, data, errors, loading, selectedId } = state;

  const fetch = useCallback(() => {
    if (typeof id === 'string') {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));

      collectionRef(id).get().then(snap => {
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

  const checkTitle = async title => {
    const result = await collectionsRef.where('title', '==', title).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }

	const validate = async data => {
    const errors = {};
    const isDuplicate = typeof id === 'string' ? false : await checkTitle(data.title);

    if (!data.title) { 
      errors.title = "Inserisci il titolo"; 
    } else if (isDuplicate) {
      errors.title = "Collezione già presente";
    }
    if (!data.description) { 
      errors.description = "Inserisci una descrizione"; 
    } else if (data.description && data.description.length > desc_maxChars) {
      errors.description = `Lunghezza massima ${desc_maxChars} caratteri`;
    } else if (data.description && data.description.length < desc_minChars) {
      errors.description = `Lunghezza minima ${desc_minChars} caratteri`;
    }
    if (!data.genres) {
      errors.genres = "Scegli almeno un genere";
    } else if (data.genres.length > 3) {
      errors.genres = "Massimo 3 generi";
    }
		return errors;
  };
  
	const onSubmit = async e => {
    e.preventDefault();
    const prevState = state;

    if (changes) {
      const errors = await validate(prevState.data);
      
      if (is.current) setState(prevState => ({ ...prevState, errors }));
      
      if (Object.keys(errors).length === 0) {
        if (is.current) setState(prevState => ({ ...prevState, loading: true }));
        const ref = data.title ? collectionRef(data.title) : collectionsRef.doc();
        ref.set({
          books_num: data.books_num || 0,
          description: data.description || '',
          title: data.title || '',
          edit: data.edit || true,
          // followers: data.followers || {},
          genres: data.genres || [],
          lastEdit_num: Number((new Date()).getTime()),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          // photoURL: data.photoURL || '',
          // source: data.source || ''
        }).then(() => {
          onToggle();
          if (is.current) setState(prevState => ({ ...prevState, loading: false }));
          openSnackbar(data.title ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(err => console.warn(err));
      }
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
      value={item.name} 
      key={item.id} 
      // insetChildren={Boolean(values)} 
      checked={values ? values.includes(item.name) : false}>
      {item.name}
    </MenuItem>
  );

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new collection" className="dialog light" ref={is}>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.title)} htmlFor="title">Titolo</InputLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  autoFocus
                  placeholder="Es: Cronache del ghiaccio e del fuoco"
                  value={data.title}
                  onChange={onChange}
                  error={Boolean(errors.title)}
                />
                {errors.title && <FormHelperText className="message error">{errors.title}</FormHelperText>}
              </FormControl>
            </div>
            <div className="form-group col col-sm-3">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.books_num)} htmlFor="books_num">Libri</InputLabel>
                <Input
                  id="books_num"
                  name="books_num"
                  type="number"
                  placeholder="Es: 5"
                  value={data.books_num}
                  onChange={onChange}
                  error={Boolean(errors.books_num)}
                />
                {errors.books_num && <FormHelperText className="message error">{errors.books_num}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.description)} htmlFor="desccription">Descrizione</InputLabel>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder={`Inserisci la descrizione (max ${desc_maxChars} caratteri)...`}
                  value={data.description}
                  onChange={onChangeMaxChars}
                  rowsMax={20}
                  multiline
                  error={Boolean(errors.description)}
                />
                {errors.description && <FormHelperText className="message error">{errors.description}</FormHelperText>}
                {(desc_leftChars !== null) && 
                  <FormHelperText className={`message ${(desc_leftChars < 0) ? 'alert' : 'neutral'}`}>
                    Caratteri rimanenti: {desc_leftChars}
                  </FormHelperText>
                }
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="form-group col">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.genres)} htmlFor="genres">Genere (max 3)</InputLabel>
                <Select
                  id="genres"
                  value={data.genres}
                  onChange={onChangeSelect("genres")}
                  multiple
                  error={Boolean(errors.genres)}>
                  {menuItemsMap(genres, data.genres)}
                </Select>
                {errors.genres && <FormHelperText className="message error">{errors.genres}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          {/* <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.source)} htmlFor="source">URL fonte</InputLabel>
                <Input
                  id="source"
                  name="source"
                  type="text"
                  placeholder="Es: //it.wikipedia.org/wiki/Cronache_del_ghiaccio_e_del_fuoco"
                  value={data.source}
                  onChange={onChange}
                  error={Boolean(errors.source)}
                />
                {errors.source && <FormHelperText className="message error">{errors.source}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          
          <div className="row">
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
          </div> */}
        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </>
  );
}

CollectionForm.propTypes = {
  onToggle: funcType.isRequired,
  openSnackbar: funcType.isRequired,
  id: stringType,
  user: userType
}

CollectionForm.defaultProps = {
  id: null,
  user: null
}

export default CollectionForm;