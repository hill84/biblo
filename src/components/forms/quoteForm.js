import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Zoom from 'react-medium-image-zoom';

import { quoteRef, quotesRef } from '../../config/firebase';
import { funcType, stringType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';

const max = { chars: {
  author: 50,
  bookTitle: 255,
  quote: 500
}};

const min = { chars: { quote: 50 }};

const QuoteForm = ({ id, onToggle }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState({
    author: '',
    bid: '',
    bookTitle: '',
    coverURL: '',
    quote: ''
  });
  const [leftChars, setLeftChars] = useState({ quote: null });
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const is = useRef(true);

  const fetch = useCallback(() => {
    if (id) {
      if (is.current) setLoading(true);
      
      quoteRef(id).get().then(snap => {
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

  const validate = data => {
    const errors = {};
    
    if (!data.quote) { 
      errors.quote = "Inserisci la citazione"; 
    } else if (data.quote.length > max.chars.quote) {
      errors.quote = `Massimo ${max.chars.quote} caratteri`;
    } else if (data.quote.length < min.chars.quote) {
      errors.quote = `Minimo ${min.chars.quote} caratteri`;
    }

    if (data.bid || data.coverURL) {
      if (!data.bookTitle) {
        errors.bookTitle = "Inserisci il titolo del libro";
      }
    }

    if (data.coverURL || data.bookTitle) {
      if (!data.bid) {
        errors.bid = "Inserisci il bid";
      }
    }

    if (data.bookTitle?.length > max.chars.bookTitle) {
      errors.bookTitle = `Massimo ${max.chars.bookTitle} caratteri`
    }

    if (!data.author) { 
      errors.author = "Inserisci l'autore"; 
    } else if (data.author.length > max.chars.author) {
      errors.author = `Massimo ${max.chars.author} caratteri`
    }
		return errors;
	};

	const onSubmit = e => {
    e.preventDefault();

    if (changes) {
      if (is.current) setLoading(true);
      const errors = validate(data);
      
      if (is.current) {
        setAuthError('');
        setErrors(errors);
      }
      
      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);

        const ref = data.qid ? quoteRef(data.qid) : quotesRef.doc();
        ref.set({
          author: data.author || '',
          bid: data.bid || '',
          bookTitle: data.bookTitle || '',
          coverURL: data.coverURL || '',
          lastEdit_num: Date.now(),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          edit: data.edit || true,
          qid: data.qid || ref.id,
          quote: data.quote || ''
        }).then(() => {
          onToggle();
          openSnackbar(data.qid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(error => {
          console.warn(error);
        }).finally(() => {
          if (is.current) setLoading(false);
        });
      } else if (is.current) setLoading(false);
    } else onToggle();
  };
  
  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new quote" className="dialog light">
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.quote)} htmlFor="quote">Citazione</InputLabel>
                <Input
                  id="quote"
                  name="quote"
                  type="text"
                  autoFocus
                  placeholder={`Inserisci la citazione (max ${max.chars.quote} caratteri)...`}
                  value={data.quote}
                  onChange={onChangeMaxChars}
                  rowsMax={20}
                  multiline
                  error={Boolean(errors.quote)}
                />
                {errors.quote && <FormHelperText className="message error">{errors.quote}</FormHelperText>}
                {leftChars.quote !== null && (
                  <FormHelperText className={`message ${leftChars.quote < 0 ? 'warning' : 'neutral'}`}>
                    Caratteri rimanenti: {leftChars.quote}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.author)} htmlFor="author">Autore</InputLabel>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  placeholder="Es: George Orwell"
                  value={data.author}
                  onChange={onChange}
                  error={Boolean(errors.author)}
                />
                {errors.author && <FormHelperText className="message error">{errors.author}</FormHelperText>}
              </FormControl>
            </div>
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.bid)} htmlFor="bid">Bid libro</InputLabel>
                <Input
                  id="bid"
                  name="bid"
                  type="text"
                  placeholder="Es: JlGUWw6oeAj3maP5MQtn"
                  value={data.bid}
                  onChange={onChange}
                  error={Boolean(errors.bid)}
                />
                {errors.bid && <FormHelperText className="message error">{errors.bid}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.bookTitle)} htmlFor="bookTitle">Titolo libro</InputLabel>
                <Input
                  id="bookTitle"
                  name="bookTitle"
                  type="text"
                  placeholder="Es: 1984"
                  value={data.bookTitle}
                  onChange={onChange}
                  error={Boolean(errors.bookTitle)}
                />
                {errors.bookTitle && <FormHelperText className="message error">{errors.bookTitle}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          <div className="row">
            {data.coverURL && (
              <div className="col-auto">
                <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                  <img alt="cover" src={data.coverURL} className="mock-cover xs prepend-input" />
                </Zoom>
              </div>
            )}
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.coverURL)} htmlFor="coverURL">URL Copertina</InputLabel>
                <Input
                  id="coverURL"
                  name="coverURL"
                  type="text"
                  placeholder="Es: https://firebasestorage.googleapis.com/.../books%2Fcover.jpg"
                  value={data.coverURL}
                  onChange={onChange}
                  error={Boolean(errors.coverURL)}
                />
                {errors.coverURL && <FormHelperText className="message error">{errors.coverURL}</FormHelperText>}
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

QuoteForm.propTypes = {
  onToggle: funcType.isRequired,
  id: stringType
}

QuoteForm.defaultProps = {
  id: null
}
 
export default QuoteForm;