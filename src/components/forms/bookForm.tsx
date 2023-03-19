import MomentUtils from '@date-io/moment';
import type { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers';
import classnames from 'classnames';
import isbn from 'isbn-utils';
import moment from 'moment';
import type { ChangeEvent, FC, FormEvent, MouseEvent } from 'react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import isISBN from 'validator/lib/isISBN';
import isURL from 'validator/lib/isURL';
import { bookRef, booksRef, collectionBookRef, collectionRef, storageRef } from '../../config/firebase';
import icon from '../../config/icons';
import type { GenreModel, ListModel } from '../../config/lists';
import { authors, awards, collections, formats, genres, languages, publishers } from '../../config/lists';
import { arrToObj, checkBadWords, extractUrls, handleFirestoreError, join, noCookie, normalizeString, numRegex, setFormatClass, validateImg } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import i18n from '../../i18n';
import type { BookEDITModel, BookModel, IsCurrent } from '../../types';
import Cover from '../cover';

interface ErrorMessagesModel {
  disableFuture?: string;
  disablePast?: string;
  invalidDate?: string;
  minDate?: string;
  maxDate?: string;
  shouldDisableDate?: string;
}

interface BookFormProps {
  book: BookModel;
  onEditing: () => void;
}

interface ErrorsModel extends Partial<Record<keyof BookModel, string>> {
  sex?: string;
  upload?: string;
}

interface MaxModel {
  chars: Record<'author' | 'collection' | 'description' | 'edition_num' | 'incipit' | 'pages_num' | 'publisher' | 'subtitle' | 'title' | 'URL', number>;
  items: Record<'authors' | 'awards' | 'collections' | 'genres' | 'languages', number>;
  publication: Date;
}

interface MinModel {
  chars: Record<'description' | 'incipit', number>;
  items: Record<'pages_num', number>;
  publication: Date;
}

const max: MaxModel = {
  chars: {
    author: 50,
    collection: 50,
    description: 2000,
    edition_num: 2,
    incipit: 2500,
    pages_num: 5,
    publisher: 100,
    subtitle: 255,
    title: 255,
    URL: 1000
  },
  items: {
    authors: 10,
    awards: 5,
    collections: 5,
    genres: 3,
    languages: 4
  },
  publication: new Date(new Date().setMonth(new Date().getMonth() + 1))
};

const min: MinModel = {
  chars: {
    description: 100,
    incipit: 255
  },
  items: {
    pages_num: 20
  },
  publication: new Date(1456, 0, 1)
};

const initialEDIT: BookEDITModel = {
  createdBy: '',
  createdByUid: '',
  created_num: 0,
  edit: true,
  lastEditBy: '',
  lastEditByUid: '',
  lastEdit_num: 0,
};

const buildInitialBook = ({
  authors = {},
  awards = [],
  bid = '',
  collections = [],
  covers = [], 
  description = '', 
  edition_num = 0, 
  format = 'Libro', 
  genres = [], 
  incipit = '',
  languages = [], 
  pages_num = 0, 
  publisher = '', 
  publication = '', 
  readers_num = 0,
  rating_num = 0,
  ratings_num = 0,
  reviews_num = 0,
  subtitle = '', 
  title = '', 
  title_sort = '',
  trailerURL = '',
  EDIT = initialEDIT,
  ISBN_10,
  ISBN_13 = 0,
}: BookModel): BookModel => {
  return {
    ISBN_10: ISBN_10 || (ISBN_13 ? isbn.parse(String(ISBN_13))?.asIsbn10() || 0 : 0), 
    ISBN_13, 
    EDIT,
    authors, 
    awards,
    bid, 
    collections,
    covers, 
    description, 
    edition_num, 
    format, 
    genres, 
    incipit,
    languages, 
    pages_num, 
    publisher, 
    publication, 
    readers_num,
    rating_num,
    ratings_num,
    reviews_num,
    subtitle, 
    title, 
    title_sort,
    trailerURL,
  };
};

const sortedGenres: GenreModel[] = genres.sort((a: GenreModel, b: GenreModel): number => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

const BookForm: FC<BookFormProps> = ({
  book: _book,
  onEditing
}: BookFormProps) => {
  const initialBook = useMemo((): BookModel => buildInitialBook(_book), [_book]);
  
  const { isAdmin, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [book, setBook] = useState<BookModel>(initialBook);
  const [changes, setChanges] = useState<string[]>([]);
  const [errors, setErrors] = useState<ErrorsModel>({});
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [imgPreview, setImgPreview] = useState<string>('');
  const [imgProgress, setImgProgress] = useState<number>(0);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [isEditingIncipit, setIsEditingIncipit] = useState<boolean>(false);
  const [isOpenChangesDialog, setIsOpenChangesDialog] = useState<boolean>(false);
  const [leftChars, setLeftChars] = useState<Record<'description' | 'incipit', number | null>>({ description: null, incipit: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [prevBook, setPrevBook] = useState<BookModel>(_book);
  const [redirectToBook, setRedirectToBook] = useState<string>('');

  const { t } = useTranslation(['form']);

  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
    return () => { is.current = false };
  }, []);

  useEffect(() => {
    setPrevBook(book);
    // eslint-disable-next-line
  }, []);

  const onToggleDescription = (e: MouseEvent): void => {
    // e.persist();
    e.preventDefault();

    setIsEditingDescription(isEditingDescription => !isEditingDescription);
  };
  
  const onToggleIncipit = (e: MouseEvent): void => {
    // e.persist();
    e.preventDefault();
    
    setIsEditingIncipit(isEditingIncipit => !isEditingIncipit);
  };

  const setChange = useCallback((name: keyof BookModel, value: unknown): void => {
    const index: number = changes.indexOf(name as never);
    const isArray: boolean = Array.isArray(value);
    const isObj: boolean = typeof value === 'object';
    // console.log(prevBook[name], value);

    if (prevBook[name] === value || ((isArray || isObj) &&  JSON.stringify(prevBook[name]) === JSON.stringify(value))) {
      if (index !== -1) {
        // console.log('remove item', name, index);
        changes.splice(index, 1);
        setChanges(changes);
      }
    } else if (index === -1) {
      setChanges(changes => ([...changes, name]));
    }
  }, [changes, prevBook, setChanges]);

  const setBookChange = useCallback((name: keyof BookModel, value: unknown): void => {
    setBook(book => ({ ...book, [name]: value }));
    setChange(name, value);
    if (errors[name]) setErrors(errors => ({ ...errors, [name]: null }));
  }, [errors, setChange]);

  const onChange = useCallback(e => {
    e.persist();
    const { name, value } = e.target;
    setBookChange(name, value);
  }, [setBookChange]);

  const onChangeNumber = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    const value_num: number = parseInt(value, 10);

    const match: RegExpMatchArray | null = value.match(numRegex);

    setBookChange((name as keyof BookModel), value_num);

    setErrors(errors => ({ ...errors, [name]: match ? null : t('ERROR_INVALID_NUMBER') }));
  }, [setBookChange, t]);

  const onChangeSelect = useCallback((e: ChangeEvent<{ name?: string; value: unknown }>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setBookChange(name as keyof BookModel, value);
  }, [setBookChange]);

  const onChangeDate = useCallback((name: keyof BookModel) => (date: Date | null): void => {
    const value = String(date);
    setBookChange(name, value);
  }, [setBookChange]);

  const onChangeCollections = (chips: string[]): void => {
    const name = 'collections';
    if (!Array.isArray(chips)) return;
    setBookChange(name, chips);
  };

  const onChangePublishers = (chip: string | null): void => {
    const name = 'publisher';
    setBookChange(name, chip || '');
  };

  const onChangeAuthors = (chips: string[]): void => {
    const name = 'authors';
    if (!Array.isArray(chips)) return;
    const value: Record<string, unknown> = arrToObj(chips.map((c: string): string => c.split('.').join('')), (item: string): { key: string; value: boolean } => ({ key: item, value: true }));
    setBookChange(name, value);
  };
  
  const onChangeMaxChars = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    setBookChange((name as keyof BookModel), value);
    setLeftChars(leftChars => ({ ...leftChars, [name]: max.chars[name as keyof MaxModel['chars']] - value.length }));
  }, [setBookChange]);

  const onSetDatePickerError = (name: string, reason: keyof ErrorMessagesModel): void => {
    const errorMessages: ErrorMessagesModel = {
      disableFuture: t('ERROR_INVALID_FUTURE_DATE'),
      disablePast: t('ERROR_INVALID_PAST_DATE'),
      invalidDate: t('ERROR_INVALID_DATE'),
      minDate: t('ERROR_MIN_DATE', { number: min.publication }),
      maxDate: t('ERROR_MAX_DATE', { number: max.publication }),
    };
    
    setErrors(errors => ({ ...errors, [name]: errorMessages[reason] }));
  };

  const checkISBNnum = useCallback(async (num: number): Promise<boolean> => {
    const result: boolean | void = await booksRef.where('ISBN_13', '==', Number(num)).limit(1).get().then((snap: DocumentData): boolean => {
      if (!snap.empty) return true;
      return false;
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    return result || false;
  }, [openSnackbar]);

  const validate = useCallback(async (book: BookModel): Promise<ErrorsModel> => {
    const errors: ErrorsModel = {};
    const isDuplicate: boolean = await checkISBNnum(book.ISBN_13);
    
    if (!book.title) {
      errors.title = t('ERROR_REQUIRED_FIELD');
    } else if (book.title.length > max.chars.title) {
      errors.title = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.title });
    }

    if (book.subtitle?.length > max.chars.subtitle) {
      errors.subtitle = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.subtitle });
    }

    if (!Object.keys(book.authors).length) {
      errors.authors = t('ERROR_REQUIRED_FIELD');
    } else if (Object.keys(book.authors).length > max.items.authors) {
      errors.authors = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.authors });
    } else if (Object.keys(book.authors).some(author => author.length > max.chars.author)) {
      errors.authors = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.author });
    }

    if (!book.publisher) {
      errors.publisher = t('ERROR_REQUIRED_FIELD');
    } else if (book.publisher.length > max.chars.publisher) {
      errors.publisher = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.publisher });
    }

    if (!book.pages_num) {
      errors.pages_num = t('ERROR_REQUIRED_FIELD');
    } else if (String(book.pages_num).length > max.chars.pages_num) {
      errors.pages_num = t('ERROR_MAX_COUNT_DIGITS', { count: max.chars.pages_num });
    } else if (book.pages_num < min.items.pages_num) {
      errors.pages_num = t('ERROR_MIN_COUNT_NUMBER', { count: min.items.pages_num });
    }

    if (!book.ISBN_13) {
      errors.ISBN_13 = t('ERROR_REQUIRED_FIELD');
    } else if (String(book.ISBN_13).length !== 13) {
      errors.ISBN_13 = t('ERROR_INVALID_DIGITS_COUNT', { count: 13 });
    } else if (String(book.ISBN_13).substring(0,3) !== '978') {
      if (String(book.ISBN_13).substring(0,3) !== '979') {
        errors.ISBN_13 = t('ERROR_ISBN13_START');
      }
    } else if (!isISBN(String(book.ISBN_13), 13)) {
      errors.ISBN_13 = t('ERROR_INVALID_FORMAT');
    } else if (!_book.bid && isDuplicate) {
      errors.ISBN_13 = t('ERROR_DUPLICATED_ITEM');
    }

    if (book.ISBN_10) {
      if (String(book.ISBN_10).length !== 10) {
        errors.ISBN_10 = t('ERROR_INVALID_DIGITS_COUNT', { count: 10 });
      } else if (!isISBN(String(book.ISBN_10), 10)) {
        errors.ISBN_10 = t('ERROR_INVALID_FORMAT');
      }
    } 

    if (new Date(book.publication).getTime() > max.publication.getTime()) {
      errors.publication = t('ERROR_INVALID_DATE');
    }

    if (book.edition_num) {
      if (book.edition_num < 1) {
        errors.edition_num = t('ERROR_INVALID_NUMBER');
      } else if (String(book.edition_num).length > max.chars.edition_num) {
        errors.edition_num = t('ERROR_MAX_COUNT_DIGITS', { count: max.chars.edition_num });
      }
    }

    if (book.languages?.length > max.items.languages) {
      errors.languages = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.languages });
    }

    if ((book.awards?.length || 0) > max.items.awards) {
      errors.awards = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.awards });
    }

    if (book.genres?.length > max.items.genres) {
      errors.genres = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.genres });
    }

    if (book.collections) {
      if (book.collections.length > max.items.collections) {
        errors.collections = t('ERROR_MAX_COUNT_ITEMS', { count: max.items.collections });
      }
      if (book.collections.some((collection: string): boolean => collection.length > max.chars.collection)) {
        errors.collections = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.collection });
      }
    }

    if (book.description) {
      if (book.description.length < min.chars.description) {
        errors.description = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.description });
        setIsEditingDescription(true);
      } else if (book.description.length > max.chars.description) {
        errors.description = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.description });
        setIsEditingDescription(true);
      }
    }

    if (book.incipit) {
      if (book.incipit.length < min.chars.incipit) {
        errors.incipit = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.incipit });
        setIsEditingIncipit(true);
      } else if (book.incipit.length > max.chars.incipit) {
        errors.incipit = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.incipit });
        setIsEditingIncipit(true);
      }
    }

    if (book.trailerURL) {
      if (!isURL(book.trailerURL)) {
        errors.trailerURL = t('ERROR_INVALID_FORMAT');
      } 
      if (book.trailerURL.length > max.chars.URL) {
        errors.trailerURL = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.URL });
      }
    }

    const potentiallyVulgarFields: Array<keyof BookModel> = ['description', 'publisher', 'subtitle', 'title'];

    potentiallyVulgarFields.forEach((text: keyof BookModel): void => {
      const value = book[text];
      const stringValue: string = typeof value === 'string' ? value : '';
      const urlMatches: RegExpMatchArray | null = extractUrls(stringValue);
      const badWords: boolean = checkBadWords(stringValue);
      if (urlMatches) {
        errors[text as keyof ErrorsModel] = t('ERROR_NO_LINK_STRING', { string: join(urlMatches, t('common:AND')) });
      } else if (badWords) {
        errors[text as keyof ErrorsModel] = t('ERROR_NO_VULGARITY');
      }
    });
    
    return errors;
  }, [checkISBNnum, _book, t]);

  const saveImage = useCallback((bid: string, file?: File): void => {
    if (!file) return;
    const uploadError: string = validateImg(file, 1) || '';
      
    if (!uploadError) {
      setImgLoading(true);
      setErrors(errors => ({ ...errors, upload: '' }));
      const uploadTask = storageRef.child(`books/${bid}/cover`).put(file);
      const unsubUploadTask = uploadTask.on('state_changed', (snap: DocumentData): void => {
        setImgProgress(snap.bytesTransferred / snap.totalBytes * 100);
      }, (err: Error): void => {
        // console.warn(`upload error: ${error.message}`);
        setErrors(errors => ({ ...errors, upload: err.message }));
        setImgLoading(false);
        setImgProgress(0);
        openSnackbar(err.message, 'error');
      }, (): void => {
        // console.log('upload completed');
        uploadTask.then((snap: DocumentData): void => {
          snap.ref.getDownloadURL().then((url: string): void => {
            const name = 'covers';
            const value: string[] = [url];

            if (is.current) {
              setImgLoading(false);
              setImgPreview(url);
              setBookChange(name, value);
              openSnackbar(t('SUCCESS_IMAGE_UPLOADED'), 'success');
              setTimeout((): void => {
                setImgProgress(0);
              }, 2000);
            }
          });
        });
        unsubUploadTask();
      });
    } else {
      setErrors(errors => ({ ...errors, upload: uploadError }));
      openSnackbar(uploadError, 'error');
    }
  }, [openSnackbar, setBookChange, t]);

  const onImageChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const file: File | undefined = e.target.files?.[0];
    const bid: string = _book.bid || book.bid;
    saveImage(bid, file);
  }, [_book.bid, book.bid, saveImage]);
  
  const onSubmit = useCallback(async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (changes.length || !book.bid) {
      setLoading(true);

      const errors: ErrorsModel = await validate(book);

      setErrors(errors);

      if (!Object.values(errors).some(Boolean)) {
        let newBid = '';
        const userUid: string = user?.uid || '';
        const userDisplayName: string = user?.displayName || '';

        if (_book.bid) {
          // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
          const { covers, EDIT, title_sort, ...restBook } = book;
          bookRef(_book.bid).set({
            ...restBook,
            covers: (imgPreview && Array(imgPreview)) || book.covers,
            title_sort: normalizeString(book.title) || book.title_sort,
            EDIT: {
              ...EDIT,
              lastEdit_num: Date.now(),
              lastEditBy: userDisplayName,
              lastEditByUid: userUid
            }
          }).then((): void => {
            if (is.current) {
              setChanges([]);
              onEditing();
              openSnackbar(t('SUCCESS_CHANGES_SAVED'), 'success');
            }
          }).catch((err: FirestoreError): void => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally((): void => {
            if (is.current) setLoading(false);
          });
        } else {
          const newBookRef: DocumentReference<DocumentData> = booksRef.doc();
          newBid = newBookRef.id;
          newBookRef.set({
            ISBN_10: String(book.ISBN_10),
            ISBN_13: book.ISBN_13, 
            authors: book.authors, 
            awards: book.awards,
            bid: newBid,
            collections: book.collections,
            covers: (imgPreview && Array(imgPreview)) || book.covers, 
            description: book.description, 
            EDIT: {
              created_num: Date.now(),
              createdBy: userDisplayName,
              createdByUid: userUid,
              edit: true,
              lastEdit_num: Date.now(),
              lastEditBy: userDisplayName,
              lastEditByUid: userUid
            },
            edition_num: book.edition_num, 
            format: book.format, 
            genres: book.genres, 
            incipit: book.incipit,
            languages: book.languages, 
            pages_num: book.pages_num, 
            publisher: book.publisher, 
            publication: book.publication, 
            readers_num: book.readers_num,
            rating_num: book.rating_num,
            ratings_num: book.ratings_num,
            reviews_num: book.reviews_num,
            subtitle: book.subtitle, 
            title: book.title, 
            title_sort: book.title_sort,
            trailerURL: noCookie(book.trailerURL)
          }).then((): void => {
            if (is.current) {
              setRedirectToBook(`${newBid}/${book.title}`);
              // setLoading(false);
              // setChanges([]);
              // onEditing();
              openSnackbar(t('SUCCESS_BOOK_CREATED'), 'success');
              // console.log(`New book created with bid ${newBid}`);
            }
          }).catch((err: FirestoreError): void => {
            if (is.current) setLoading(false);
            openSnackbar(handleFirestoreError(err), 'error');
          });
        }
        if (book.collections) {
          const bookCover: string = book.covers[0];
          book.collections.forEach((cid: string): void => {
            collectionBookRef(cid, book.bid || newBid).get().then((collection: DocumentData): void => {
              if (collection.exists) { 
                collectionBookRef(cid, book.bid || newBid).get().then((collectionBook: DocumentData): void => {
                  collectionBookRef(cid, book.bid || newBid).set({
                    bid: book.bid || newBid, 
                    bcid: collectionBook.exists ? collectionBook.data().bcid : (collection.data().books_num || 0) + 1,
                    covers: (imgPreview && Array(imgPreview)) || (!!bookCover && Array(bookCover)) || [],
                    title: book.title,  
                    subtitle: book.subtitle, 
                    authors: book.authors, 
                    publisher: book.publisher,
                    publication: book.publication,
                    rating_num: book.rating_num,
                    ratings_num: book.ratings_num
                  }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
                }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
              } else {
                collectionRef(cid).set({
                  title: cid,
                  books_num: 0,
                  description: '',
                  edit: true,
                  genres: book.genres
                }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
              }
            }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
          });
        }
      } else {
        setLoading(false);
        if (errors.description) setIsEditingDescription(true);
        if (errors.incipit) setIsEditingIncipit(true);
        openSnackbar(t('ERROR_SUBMIT'), 'error');
      }
    } else onEditing();
  }, [_book.bid, book, changes.length, imgPreview, onEditing, openSnackbar, t, user?.displayName, user?.uid, validate]);

  const onExitEditing = useCallback(() => {
    if (changes.length) {
      setIsOpenChangesDialog(true);
    } else onEditing();
  }, [changes, onEditing]);

  const onCloseChangesDialog = (): void => setIsOpenChangesDialog(false);
  
  const menuItemsMap = <G extends ListModel>(arr: G[], values?: string[]) => arr.map(({ id, name }: G) => (
    <MenuItem 
      value={name} 
      key={id} 
      // insetChildren={Boolean(values)} 
      selected={values?.includes(name)}>
      {name}
    </MenuItem>
  ));
  
  if (redirectToBook) return <Redirect to={`/book/${redirectToBook}`} />;
  
  return (
    <>
      <div className='container top' ref={is}>
        <form className='card light'>
          {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
          <div className='container md'>
            <div className={classnames('edit-book-cover', { error: errors.upload }, `${setFormatClass(book.format)}-format`)}>
              <Cover book={book} loading={imgLoading} />
              {isAdmin && book.bid && (
                <button type='button' className={classnames('btn', 'sm', 'centered', 'rounded', imgProgress === 100 ? 'success' : 'flat')}>
                  <input type='file' accept='image/*' className='upload' onChange={onImageChange} />
                  {/* imgProgress > 0 && <progress type='progress' value={imgProgress} max='100' /> */}
                  <span>{t(`common:${imgProgress === 100 ? 'ACTION_UPLOADED_IMAGE' : 'ACTION_UPLOAD_IMAGE'}`)}</span>
                </button>
              )}
            </div>
            <div className='edit-book-info'>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.title)} htmlFor='title'>
                    {t('LABEL_TITLE')}
                  </InputLabel>
                  <Input
                    id='title'
                    name='title'
                    type='text'
                    placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Sherlock Holmes' })}
                    error={Boolean(errors.title)}
                    value={book.title || ''}
                    onChange={onChange}
                  />
                  {errors.title && <FormHelperText className='message error'>{errors.title}</FormHelperText>}
                </FormControl>
              </div>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.subtitle)} htmlFor='subtitle'>
                    {t('LABEL_SUBTITLE')}
                  </InputLabel>
                  <Input
                    id='subtitle'
                    name='subtitle'
                    type='text'
                    placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Uno studio in rosso' })}
                    error={Boolean(errors.subtitle)}
                    value={book.subtitle || ''}
                    onChange={onChange}
                  />
                  {errors.subtitle && <FormHelperText className='message error'>{errors.subtitle}</FormHelperText>}
                </FormControl>
              </div>
              <div className='form-group'>
                <FormControl className='chip-input' margin='normal' fullWidth>
                  <Autocomplete
                    autoSelect
                    clearOnBlur
                    multiple
                    id='authors'
                    onChange={(_e, value): void => onChangeAuthors(value as string[])}
                    options={authors}
                    value={Object.keys(book.authors)}
                    freeSolo
                    renderTags={(value, getTagProps) => 
                      value.map((option, index) => (
                        <Chip
                          key={option[index]}
                          variant='default'
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params: object) => (
                      <TextField
                        {...params}
                        error={Boolean(errors.authors)}
                        variant='standard'
                        label={`${t('LABEL_AUTHORS')} (max ${max.items.authors})`}
                        placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Arthur Conan Doyle' })}
                      />
                    )}
                  />
                  <FormHelperText className={classnames('message', { error: errors.authors })}>
                    {errors.authors || 'Premi invio per confermare'}
                  </FormHelperText>
                </FormControl>
              </div>
              <div className='row'>
                <div className='form-group col-sm-6'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.ISBN_13)} htmlFor='ISBN_13'>
                      ISBN-13
                    </InputLabel>
                    <Input
                      id='ISBN_13'
                      name='ISBN_13'
                      type='number'
                      placeholder={t('PLACEHOLDER_EG_STRING', { string: '9788854152601' })}
                      error={Boolean(errors.ISBN_13)}
                      value={Number(book.ISBN_13) || ''}
                      onChange={onChangeNumber}
                    />
                    {errors.ISBN_13 && <FormHelperText className='message error'>{errors.ISBN_13}</FormHelperText>}
                  </FormControl>
                </div>
                <div className='form-group col-sm-6'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.ISBN_10)} htmlFor='ISBN_10'>
                      ISBN-10
                    </InputLabel>
                    <Input
                      id='ISBN_10'
                      name='ISBN_10'
                      type='text'
                      placeholder={t('PLACEHOLDER_EG_STRING', { string: '8854152609' })}
                      error={Boolean(errors.ISBN_10)}
                      value={book.ISBN_10 || ''}
                      onChange={onChange}
                    />
                    {errors.ISBN_10 && <FormHelperText className='message error'>{errors.ISBN_10}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className='row'>
                <div className='form-group col-8'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <Autocomplete
                      autoSelect
                      clearOnBlur
                      id='publisher'
                      onChange={(_e, value: string | null): void => onChangePublishers(value)}
                      options={publishers}
                      value={book.publisher}
                      freeSolo
                      renderTags={(value, getTagProps) => 
                        value.map((option, index) => (
                          <Chip
                            key={option[index]}
                            variant='default'
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params: object) => (
                        <TextField
                          {...params}
                          disabled={!isAdmin}
                          error={Boolean(errors.publisher)}
                          variant='standard'
                          label={t('LABEL_PUBLISHER')}
                          placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Newton Compton' })}
                        />
                      )}
                    />
                    {errors.publisher && <FormHelperText className='message error'>{errors.publisher}</FormHelperText>}
                  </FormControl>
                </div>
                <div className='form-group col-4'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.pages_num)} htmlFor='pages_num'>
                      {t('LABEL_PAGES')}
                    </InputLabel>
                    <Input
                      id='pages_num'
                      name='pages_num'
                      type='number'
                      placeholder={t('PLACEHOLDER_EG_STRING', { string: '128' })}
                      error={Boolean(errors.pages_num)}
                      value={Number(book.pages_num) || ''}
                      onChange={onChangeNumber}
                    />
                    {errors.pages_num && <FormHelperText className='message error'>{errors.pages_num}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className='row'>
                <div className='form-group col-8'>
                  <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale={i18n.language}>
                    <DatePicker
                      className='date-picker'
                      // name='publication'
                      cancelText={t('common:ACTION_CANCEL')}
                      leftArrowIcon={icon.chevronLeft}
                      rightArrowIcon={icon.chevronRight}
                      // inputFormat='DD/MM/YYYY'
                      // disableFuture
                      minDate={min.publication}
                      maxDate={max.publication}
                      // error={Boolean(errors.publication)}
                      label={t('LABEL_PUBLICATION_DATE')}
                      value={book.publication ? new Date(book.publication) : null}
                      onChange={onChangeDate('publication')}
                      onError={reason => reason && onSetDatePickerError('publication', reason)}
                      // autoOk
                      clearable
                      renderInput={props => (
                        <TextField {...props} margin='normal' fullWidth helperText={errors.publication} />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <div className='form-group col-4'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.edition_num)} htmlFor='edition_num'>
                      {t('LABEL_EDITION')}
                    </InputLabel>
                    <Input
                      id='edition_num'
                      className='spin-buttons'
                      name='edition_num'
                      type='number'
                      placeholder={t('PLACEHOLDER_EG_STRING', { string: '1' })}
                      error={Boolean(errors.edition_num)}
                      value={Number(book.edition_num) || ''}
                      onChange={onChangeNumber}
                    />
                    {errors.edition_num && <FormHelperText className='message error'>{errors.edition_num}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className='row'>
                <div className='form-group col-sm-8'>
                  <FormControl className='select-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.languages)} htmlFor='languages'>
                      {t('LABEL_LANGUAGES')} (max {max.items.languages})
                    </InputLabel>
                    <Select
                      error={Boolean(errors.languages)}
                      id='languages'
                      multiple
                      name='languages'
                      onChange={onChangeSelect}
                      value={book.languages}
                    >
                      {menuItemsMap(languages, book.languages)}
                    </Select>
                    {errors.languages && <FormHelperText className='message error'>{errors.languages}</FormHelperText>}
                  </FormControl>
                </div>
                <div className='form-group col-sm-4'>
                  <FormControl className='select-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.format)} htmlFor='format'>
                      {t('LABEL_FORMAT')}
                    </InputLabel>
                    <Select
                      error={Boolean(errors.format)}
                      id='format'
                      name='format'
                      onChange={onChangeSelect}
                      value={book.format}
                    >
                      {menuItemsMap(formats, [book.format])}
                    </Select>
                    {errors.format && <FormHelperText className='message error'>{errors.format}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className='form-group'>
                <FormControl className='select-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.genres)} htmlFor='genres'>
                    {t('LABEL_GENRES')} (max {max.items.genres})
                  </InputLabel>
                  <Select
                    error={Boolean(errors.genres)}
                    id='genres'
                    multiple
                    name='genres'
                    onChange={onChangeSelect}
                    placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Thriller' })}
                    value={book.genres}
                  >
                    {menuItemsMap(sortedGenres, book.genres)}
                  </Select>
                  {errors.sex && <FormHelperText className='message error'>{errors.sex}</FormHelperText>}
                </FormControl>
              </div>
              {isAdmin && (
                <>
                  <div className='form-group'>
                    <FormControl className='chip-input' margin='normal' fullWidth>
                      <Autocomplete
                        autoSelect
                        clearOnBlur
                        multiple
                        id='collections'
                        onChange={(_e, value): void => onChangeCollections(value as string[])}
                        options={collections}
                        value={book.collections}
                        freeSolo
                        renderTags={(value, getTagProps) => 
                          value.map((option, index) => (
                            <Chip
                              key={option[index]}
                              variant='default'
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params: object) => (
                          <TextField
                            {...params}
                            disabled={!isAdmin}
                            error={Boolean(errors.collections)}
                            variant='standard'
                            label={`${t('LABEL_COLLECTIONS')} (max ${max.items.collections})`}
                            placeholder={t('PLACEHOLDER_EG_STRING', { string: 'Sherlock Holmes' })}
                          />
                        )}
                      />
                      {errors.collections && <FormHelperText className='message error'>{errors.collections}</FormHelperText>}
                    </FormControl>
                  </div>
                  <div className='form-group'>
                    <FormControl className='input-field' margin='normal' fullWidth>
                      <InputLabel error={Boolean(errors.trailerURL)} htmlFor='trailerURL'>
                        {t('LABEL_VIDEO_TRAILER')}
                      </InputLabel>
                      <Input
                        id='trailerURL'
                        name='trailerURL'
                        type='url'
                        placeholder={t('PLACEHOLDER_EG_STRING', { string: 'https://www.youtube.com/...' })}
                        error={Boolean(errors.trailerURL)}
                        value={book.trailerURL}
                        disabled={!isAdmin}
                        onChange={onChange}
                      />
                      {errors.trailerURL && <FormHelperText className='message error'>{errors.trailerURL}</FormHelperText>}
                    </FormControl>
                  </div>

                  <div className='form-group'>
                    <FormControl className='select-field' margin='normal' fullWidth>
                      <InputLabel error={Boolean(errors.awards)} htmlFor='awards'>
                        {t('LABEL_AWARDS_WON')} (max {max.items.awards})
                      </InputLabel>
                      <Select
                        error={Boolean(errors.awards)}
                        id='awards'
                        multiple
                        name='awards'
                        onChange={onChangeSelect}
                        value={book.awards}
                      >
                        {menuItemsMap(awards, book.awards)}
                      </Select>
                      {errors.awards && <FormHelperText className='message error'>{errors.awards}</FormHelperText>}
                    </FormControl>
                  </div>
                </>
              )}
              {isEditingDescription ? (
                <div className='form-group'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.description)} htmlFor='description'>
                      {t('LABEL_DESCRIPTION')}
                    </InputLabel>
                    <Input
                      id='description'
                      name='description'
                      type='text'
                      placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.description })}
                      error={Boolean(errors.description)}
                      value={book.description}
                      onChange={onChangeMaxChars}
                      maxRows={30}
                      multiline
                    />
                    {errors.description && <FormHelperText className='message error'>{errors.description}</FormHelperText>}
                    {leftChars.description !== null && (
                      <FormHelperText className={classnames('message', leftChars.description < 0 ? 'warning' : 'neutral')}>
                        {t('REMAINING_CHARACTERS')}: {leftChars.description}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              ) : (
                <div className='info-row'>
                  <button type='button' className='btn flat rounded centered' onClick={onToggleDescription}>
                    {t(`common:${book.description ? 'ACTION_EDIT_DESCRIPTION' : 'ACTION_ADD_DESCRIPTION'}`)}
                  </button>
                </div>
              )}
              {isEditingIncipit ? (
                <div className='form-group'>
                  <FormControl className='input-field' margin='normal' fullWidth>
                    <InputLabel error={Boolean(errors.incipit)} htmlFor='incipit'>
                      {t('LABEL_INCIPIT')}
                    </InputLabel>
                    <Input
                      id='incipit'
                      name='incipit'
                      type='text'
                      placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.incipit })}
                      error={Boolean(errors.incipit)}
                      value={book.incipit || ''}
                      onChange={onChangeMaxChars}
                      maxRows={30}
                      multiline
                    />
                    {errors.incipit && <FormHelperText className='message error'>{errors.incipit}</FormHelperText>}
                    {leftChars.incipit !== null && (
                      <FormHelperText className={classnames('message', leftChars.incipit < 0 ? 'warning' : 'neutral')}>
                        {t('REMAINING_CHARACTERS')}: {leftChars.incipit}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              ) : (
                <div className='info-row'>
                  <button type='button' className='btn flat rounded centered' onClick={onToggleIncipit}>
                    {t(`common:${book.incipit ? 'ACTION_EDIT_INCIPIT' : 'ACTION_ADD_INCIPIT'}`)}
                  </button>
                </div>
              )}

            </div>
          </div>
          <div className='footer no-gutter'>
            <button type='button' onClick={onSubmit} className='btn btn-footer primary'>
              {t(`common:${book.bid ? 'ACTION_SAVE' : 'ACTION_CREATE_BOOK'}`)}
            </button>
          </div>
        </form>
        {book.bid && (
          <div className='form-group'>
            <button type='button' onClick={onExitEditing} className='btn flat rounded centered'>
              {t('common:ACTION_CANCEL')}
            </button>
          </div>
        )}
      </div>

      {isOpenChangesDialog && (
        <Dialog
          open={isOpenChangesDialog}
          keepMounted
          onClose={onCloseChangesDialog}
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>
            {t('DIALOG_UNSAVED_CHANGES_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              {t('DIALOG_UNSAVED_CHANGES_TEXT')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onEditing}>{t('common:ACTION_LEAVE')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onSubmit}>{t('common:ACTION_SAVE')}</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default BookForm;