import type { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import classnames from 'classnames';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collectionRef, collectionsRef } from '../../config/firebase';
import { genres } from '../../config/lists';
import { handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import type { IsCurrent } from '../../types';
import Overlay from '../overlay';

interface MaxModel {
  chars: Record<'desc' | 'title', number>;
  items: Record<'genres', number>;
}

interface MinModel {
  chars: Record<'desc', number>;
  items: Record<'books_num', number>;
}

const max: MaxModel = {
  chars: {
    desc: 1000,
    title: 100
  },
  items: { genres: 3 }
};

const min: MinModel = {
  chars: { desc: 50 },
  items: { books_num: 4 }
};

interface CollectionFormProps {
  id?: string;
  onToggle: (id?: string) => void;
}

interface DataModel {
  books_num: number;
  description: string;
  edit: boolean;
  genres: string[];
  title: string;
}

type ErrorsModel = Partial<Record<'books_num' | 'description' | 'genres' | 'title', string>>;

const CollectionForm: FC<CollectionFormProps> = ({
  id,
  onToggle
}: CollectionFormProps) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState<DataModel>({
    books_num: 0,
    description: '',
    edit: true,
    genres: [],
    title: ''
  });
  const [leftChars, setLeftChars] = useState<Record<'desc', number | null>>({ desc: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [changes, setChanges] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsModel>({});

  const { t } = useTranslation(['form']);

  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
    return () => { is.current = false };
  }, []);

  const fetch = useCallback(() => {
    if (id) {
      setLoading(true);

      collectionRef(id).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          if (is.current) setData(snap.data());
        }
      }).catch((err: FirestoreError): void => {
        console.warn(err);
      }).finally((): void => {
        if (is.current) setLoading(false);
      });
    }
  }, [id]);

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setChanges(true);
    setData({ ...data, [name]: value }); 
    setErrors({ ...errors, [name]: undefined });
  };

  const onChangeMaxChars = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setChanges(true);
    setData({ ...data, [name]: value });
    setLeftChars({ ...leftChars, [name]: max.chars[name as keyof MaxModel['chars']] - String(value).length });
    setErrors({ ...errors, [name]: undefined });
  };

  const onChangeSelect = (e: ChangeEvent<{ name?: string; value: unknown }>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setChanges(true);
    setData({ ...data, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  const checkTitle = async (title: string): Promise<boolean> => {
    const result = await collectionsRef.where('title', '==', title).limit(1).get().then((snap: DocumentData): boolean => {
      if (!snap.empty) return true;
      return false;
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    return result || false;
  };

  const validate = async (data: DataModel): Promise<ErrorsModel> => {
    const errors: ErrorsModel = {};
    const isDuplicate: boolean = typeof id === 'string' ? false : await checkTitle(data.title);

    if (!data.title) { 
      errors.title = t('ERROR_REQUIRED_FIELD'); 
    } else if (isDuplicate) {
      errors.title = t('ERROR_DUPLICATED_ITEM');
    } else if (data.title?.length > max.chars.title) {
      errors.title = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.title });
    }
    if (!data.description) { 
      errors.description = t('ERROR_REQUIRED_FIELD'); 
    } else if (data.description?.length > max.chars.desc) {
      errors.description = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.desc });
    } else if (data.description?.length < min.chars.desc) {
      errors.description = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.desc });
    }
    if (!data.genres) {
      errors.genres = 'Scegli almeno un genere';
    } else if (data.genres.length > max.items.genres) {
      errors.genres = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.genres });
    }
    if (!data.books_num) {
      errors.books_num = t('ERROR_REQUIRED_FIELD');
    } else if (data.books_num < min.items.books_num) {
      errors.books_num = t('ERROR_MIN_COUNT_ITEMS', { count: min.items.books_num });
    }
    return errors;
  };
  
  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (changes) {
      setLoading(true);
      const errors: ErrorsModel = await validate(data);
      
      setErrors(errors);
      
      if (!Object.values(errors).some(Boolean)) {
        const ref: DocumentReference<DocumentData> = data.title ? collectionRef(data.title) : collectionsRef.doc();
        ref.set({
          books_num: data.books_num || 0,
          description: data.description || '',
          title: data.title || '',
          edit: data.edit || true,
          // followers: data.followers || {},
          genres: data.genres || [],
          lastEdit_num: Date.now(),
          lastEditBy: user?.displayName,
          lastEditByUid: user?.uid,
          // photoURL: data.photoURL || '',
          // source: data.source || ''
        }).then((): void => {
          if (is.current) {
            onToggle();
            openSnackbar(data.title ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
          }
        }).catch((err: Error): void => {
          console.warn(err);
        }).finally((): void => {
          if (is.current) setLoading(false);
        });
      } else setLoading(false);
    } else onToggle();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const menuItemsMap = (arr: any[], values?: string[]) => arr.map((item: any) => (
    <MenuItem 
      value={item.name} 
      key={item.id} 
      // insetChildren={Boolean(values)} 
      selected={values ? values.includes(item.name) : false}>
      {item.name}
    </MenuItem>
  ));

  return (
    <>
      <Overlay onClick={() => onToggle()} />
      <div role='dialog' aria-describedby='new collection' className='dialog light' ref={is}>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <div className='content'>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.title)} htmlFor='title'>
                  {t('LABEL_TITLE')}
                </InputLabel>
                <Input
                  id='title'
                  name='title'
                  type='text'
                  autoFocus
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Harry Potter' })}
                  value={data.title}
                  onChange={onChange}
                  error={Boolean(errors.title)}
                />
                {errors.title && <FormHelperText className='message error'>{errors.title}</FormHelperText>}
              </FormControl>
            </div>
            <div className='form-group col col-sm-3'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.books_num)} htmlFor='books_num'>
                  {t('LABEL_BOOKS')}
                </InputLabel>
                <Input
                  id='books_num'
                  name='books_num'
                  type='number'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: '7' })}
                  value={data.books_num}
                  onChange={onChange}
                  error={Boolean(errors.books_num)}
                />
                {errors.books_num && <FormHelperText className='message error'>{errors.books_num}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.description)} htmlFor='desccription'>
                  {t('LABEL_DESCRIPTION')}
                </InputLabel>
                <Input
                  id='description'
                  name='description'
                  type='text'
                  placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.desc })}
                  value={data.description}
                  onChange={onChangeMaxChars}
                  maxRows={20}
                  multiline
                  error={Boolean(errors.description)}
                />
                {errors.description && <FormHelperText className='message error'>{errors.description}</FormHelperText>}
                {(leftChars.desc !== null) && (
                  <FormHelperText className={classnames('message', leftChars.desc < 0 ? 'warning' : 'neutral')}>
                    {t('REMAINING_CHARACTERS')}: {leftChars.desc}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          <div className='row'>
            <div className='form-group col'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.genres)} htmlFor='genres'>
                  {t('LABEL_GENRES')} (max {max.items.genres})
                </InputLabel>
                <Select
                  id='genres'
                  value={data.genres}
                  onChange={onChangeSelect}
                  multiple
                  name='genres'
                  error={Boolean(errors.genres)}>
                  {menuItemsMap(genres, data.genres)}
                </Select>
                {errors.genres && <FormHelperText className='message error'>{errors.genres}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          {/* <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.source)} htmlFor='source'>
                  {t('LABEL_SOURCE_URL)}
                </InputLabel>
                <Input
                  id='source'
                  name='source'
                  type='text'
                  placeholder='Es: https://it.wikipedia.org/wiki/Cronache_del_ghiaccio_e_del_fuoco'
                  value={data.source}
                  onChange={onChange}
                  error={Boolean(errors.source)}
                />
                {errors.source && <FormHelperText className='message error'>{errors.source}</FormHelperText>}
              </FormControl>
            </div>
          </div>
          
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.photoURL)} htmlFor='photoURL'>
                  {t('LABEL_IMAGE_URL)}
                </InputLabel>
                <Input
                  id='photoURL'
                  name='photoURL'
                  type='text'
                  placeholder='Es: https://firebasestorage.googleapis.com/.../authors%2Fauthor.jpg'
                  value={data.photoURL}
                  onChange={onChange}
                  error={Boolean(errors.photoURL)}
                />
                {errors.photoURL && <FormHelperText className='message error'>{errors.photoURL}</FormHelperText>}
              </FormControl>
            </div>
          </div> */}
        </div>
        <div className='footer no-gutter'>
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </>
  );
};

export default CollectionForm;