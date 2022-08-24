import { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import classnames from 'classnames';
import React, { ChangeEvent, FC, FormEvent, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import { quoteRef, quotesRef } from '../../config/firebase';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';

interface MaxModel {
  chars: Record<'author' | 'bookTitle' | 'quote', number>;
}

interface MinModel {
  chars: Record<'quote', number>;
}

const max: MaxModel = { chars: {
  author: 50,
  bookTitle: 255,
  quote: 500
}};

const min: MinModel = { chars: { quote: 50 }};

interface QuoteFormProps {
  id?: string;
  onToggle: (id?: string) => void;
}

interface ErrorsModel {
  quote?: string;
  bookTitle?: string;
  bid?: string;
  author?: string;
  coverURL?: string;
}

interface DataModel {
  author: string;
  bid: string;
  bookTitle: string;
  coverURL: string;
  quote: string;
  qid?: string;
  edit?: string;
  displayName?: string;
}

const QuoteForm: FC<QuoteFormProps> = ({ id, onToggle }: QuoteFormProps) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState<DataModel>({
    author: '',
    bid: '',
    bookTitle: '',
    coverURL: '',
    quote: ''
  });
  const [leftChars, setLeftChars] = useState({ quote: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [changes, setChanges] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsModel>({});
  const [authError, setAuthError] = useState<string>('');

  const fetch = useCallback((): void => {
    if (id) {
      setLoading(true);
      
      quoteRef(id).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          setData(snap.data());
        }
      }).catch((err: FirestoreError): void => {
        console.warn(err);
      }).finally((): void => {
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    
    setChanges(true);
    setData({ ...data, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const onChangeMaxChars = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    setChanges(true);
    setData({ ...data, [name]: value });
    setLeftChars({ ...leftChars, [name]: max.chars[name as keyof MaxModel['chars']] - value.length });
    setErrors({ ...errors, [name]: null });
  };

  const validate = (data: DataModel): ErrorsModel => {
    const errors: ErrorsModel = {};
    
    if (!data.quote) { 
      errors.quote = 'Inserisci la citazione'; 
    } else if (data.quote.length > max.chars.quote) {
      errors.quote = `Massimo ${max.chars.quote} caratteri`;
    } else if (data.quote.length < min.chars.quote) {
      errors.quote = `Minimo ${min.chars.quote} caratteri`;
    }

    if (data.bid || data.coverURL) {
      if (!data.bookTitle) {
        errors.bookTitle = 'Inserisci il titolo del libro';
      }
    }

    if (data.coverURL || data.bookTitle) {
      if (!data.bid) {
        errors.bid = 'Inserisci il bid';
      }
    }

    if (data.bookTitle?.length > max.chars.bookTitle) {
      errors.bookTitle = `Massimo ${max.chars.bookTitle} caratteri`;
    }

    if (!data.author) { 
      errors.author = 'Inserisci l\'autore'; 
    } else if (data.author.length > max.chars.author) {
      errors.author = `Massimo ${max.chars.author} caratteri`;
    }
    return errors;
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();

    if (changes) {
      setLoading(true);
      const errors: ErrorsModel = validate(data);
      
      setAuthError('');
      setErrors(errors);
      
      if (Object.keys(errors).length === 0) {
        setLoading(true);

        const ref: DocumentReference<DocumentData> = data.qid ? quoteRef(data.qid) : quotesRef.doc();
        ref.set({
          author: data.author || '',
          bid: data.bid || '',
          bookTitle: data.bookTitle || '',
          coverURL: data.coverURL || '',
          lastEdit_num: Date.now(),
          lastEditBy: user?.displayName,
          lastEditByUid: user?.uid,
          edit: data.edit || true,
          qid: data.qid || ref.id,
          quote: data.quote || ''
        }).then((): void => {
          onToggle();
          openSnackbar(data.qid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch((err: FirestoreError): void => {
          console.warn(err);
        }).finally((): void => {
          setLoading(false);
        });
      } else setLoading(false);
    } else onToggle();
  };
  
  return (
    <Fragment>
      <Overlay onClick={() => onToggle()} />
      <div role='dialog' aria-describedby='new quote' className='dialog light'>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <div className='content'>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.quote)} htmlFor='quote'>Citazione</InputLabel>
                <Input
                  id='quote'
                  name='quote'
                  type='text'
                  autoFocus
                  placeholder={`Inserisci la citazione (max ${max.chars.quote} caratteri)...`}
                  value={data.quote}
                  onChange={onChangeMaxChars}
                  maxRows={20}
                  multiline
                  error={Boolean(errors.quote)}
                />
                {errors.quote && <FormHelperText className='message error'>{errors.quote}</FormHelperText>}
                {leftChars.quote !== null && (
                  <FormHelperText className={classnames('message', (leftChars?.quote || 0) < 0 ? 'warning' : 'neutral')}>
                    Caratteri rimanenti: {leftChars.quote}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.author)} htmlFor='author'>Autore</InputLabel>
                <Input
                  id='author'
                  name='author'
                  type='text'
                  placeholder='Es: George Orwell'
                  value={data.author}
                  onChange={onChange}
                  error={Boolean(errors.author)}
                />
                {errors.author && <FormHelperText className='message error'>{errors.author}</FormHelperText>}
              </FormControl>
            </div>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.bid)} htmlFor='bid'>Bid libro</InputLabel>
                <Input
                  id='bid'
                  name='bid'
                  type='text'
                  placeholder='Es: JlGUWw6oeAj3maP5MQtn'
                  value={data.bid}
                  onChange={onChange}
                  error={Boolean(errors.bid)}
                />
                {errors.bid && <FormHelperText className='message error'>{errors.bid}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.bookTitle)} htmlFor='bookTitle'>Titolo libro</InputLabel>
                <Input
                  id='bookTitle'
                  name='bookTitle'
                  type='text'
                  placeholder='Es: 1984'
                  value={data.bookTitle}
                  onChange={onChange}
                  error={Boolean(errors.bookTitle)}
                />
                {errors.bookTitle && <FormHelperText className='message error'>{errors.bookTitle}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          <div className='row'>
            {data.coverURL && (
              <div className='col-auto'>
                <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
                  <img alt='cover' src={data.coverURL} className='mock-cover xs prepend-input' />
                </Zoom>
              </div>
            )}
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.coverURL)} htmlFor='coverURL'>URL Copertina</InputLabel>
                <Input
                  id='coverURL'
                  name='coverURL'
                  type='text'
                  placeholder='Es: https://firebasestorage.googleapis.com/.../books%2Fcover.jpg'
                  value={data.coverURL}
                  onChange={onChange}
                  error={Boolean(errors.coverURL)}
                />
                {errors.coverURL && <FormHelperText className='message error'>{errors.coverURL}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          {authError && <div className='row'><div className='col message error'>{authError}</div></div>}
        </div>
        <div className='footer no-gutter'>
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </Fragment>
  );
};
 
export default QuoteForm;