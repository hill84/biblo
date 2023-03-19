import type { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import classnames from 'classnames';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation(['form']);

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
      errors.quote = t('ERROR_REQUIRED_FIELD'); 
    } else if (data.quote.length > max.chars.quote) {
      errors.quote = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.quote });
    } else if (data.quote.length < min.chars.quote) {
      errors.quote = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.quote });
    }

    if (data.bid || data.coverURL) {
      if (!data.bookTitle) {
        errors.bookTitle = t('ERROR_REQUIRED_FIELD');
      }
    }

    if (data.coverURL || data.bookTitle) {
      if (!data.bid) {
        errors.bid = t('ERROR_REQUIRED_FIELD');
      }
    }

    if (data.bookTitle?.length > max.chars.bookTitle) {
      errors.bookTitle = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.bookTitle });
    }

    if (!data.author) { 
      errors.author = t('ERROR_REQUIRED_FIELD'); 
    } else if (data.author.length > max.chars.author) {
      errors.author = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.author });
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
      
      if (!Object.values(errors).some(Boolean)) {
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
    <>
      <Overlay onClick={() => onToggle()} />
      <div role='dialog' aria-describedby='new quote' className='dialog light'>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <div className='content'>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.quote)} htmlFor='quote'>
                  {t('LABEL_QUOTE')}
                </InputLabel>
                <Input
                  id='quote'
                  name='quote'
                  type='text'
                  autoFocus
                  placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.quote })}
                  value={data.quote}
                  onChange={onChangeMaxChars}
                  maxRows={20}
                  multiline
                  error={Boolean(errors.quote)}
                />
                {errors.quote && <FormHelperText className='message error'>{errors.quote}</FormHelperText>}
                {leftChars.quote !== null && (
                  <FormHelperText className={classnames('message', (leftChars?.quote || 0) < 0 ? 'warning' : 'neutral')}>
                    {t('REMAINING_CHARACTERS')}: {leftChars.quote}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.author)} htmlFor='author'>
                  {t('LABEL_AUTHOR')}
                </InputLabel>
                <Input
                  id='author'
                  name='author'
                  type='text'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'George Orwell' })}
                  value={data.author}
                  onChange={onChange}
                  error={Boolean(errors.author)}
                />
                {errors.author && <FormHelperText className='message error'>{errors.author}</FormHelperText>}
              </FormControl>
            </div>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.bid)} htmlFor='bid'>Bid</InputLabel>
                <Input
                  id='bid'
                  name='bid'
                  type='text'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'JlGUWw6oeAj3maP5MQtn' })}
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
                <InputLabel error={Boolean(errors.bookTitle)} htmlFor='bookTitle'>
                  {t('LABEL_TITLE')}
                </InputLabel>
                <Input
                  id='bookTitle'
                  name='bookTitle'
                  type='text'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: '1984' })}
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
                <InputLabel error={Boolean(errors.coverURL)} htmlFor='coverURL'>
                  {t('LABEL_IMAGE_URL')}
                </InputLabel>
                <Input
                  id='coverURL'
                  name='coverURL'
                  type='text'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'https://firebasestorage.googleapis.com/.../books%2Fcover.jpg' })}
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
    </>
  );
};
 
export default QuoteForm;