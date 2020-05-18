import MomentUtils from '@date-io/moment';
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
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import isbn from 'isbn-utils';
import ChipInput from 'material-ui-chip-input';
import moment from 'moment';
import 'moment/locale/it';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Redirect } from 'react-router-dom';
import isISBN from 'validator/lib/isISBN';
import isURL from 'validator/lib/isURL';
import { bookRef, booksRef, collectionBookRef, collectionRef, storageRef } from '../../config/firebase';
import icon from '../../config/icons';
import { awards, formats, genres, languages } from '../../config/lists';
import { arrToObj, checkBadWords, extractUrls, handleFirestoreError, join, noCookie, normalizeString, numRegex, setFormatClass, validateImg } from '../../config/shared';
import { bookType, funcType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Cover from '../cover';

moment.locale('it');

const max = {
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
    authors: 5,
    awards: 5,
    collections: 5,
    genres: 3,
    languages: 4
  },
  publication: new Date(new Date().setMonth(new Date().getMonth() + 1))
};

const min = {
  chars: {
    description: 100,
    incipit: 255
  },
  items: {
    pages_num: 20
  },
  publication: new Date(1970, 0, 1)
}

const BookForm = props => {
  const { isAdmin, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { book: _book, onEditing } = props;
  const [book, setBook] = useState({
    ISBN_10: _book.ISBN_10 || (_book.ISBN_13 ? isbn.parse(_book.ISBN_13) ? isbn.parse(_book.ISBN_13).asIsbn10() : 0 : 0), 
    ISBN_13: _book.ISBN_13 || 0, 
    EDIT: _book.EDIT || {
      createdBy: _book.createdBy || '',
      createdByUid: _book.createdByUid || '',
      created_num: _book.created || 0,
      edit: true,
      lastEditBy: _book.lastEditBy || '',
      lastEditByUid: _book.lastEditByUid || '',
      lastEdit_num: _book.lastEdit || 0
    },
    authors: _book.authors || {}, 
    awards: _book.awards || [],
    bid: _book.bid || '', 
    collections: _book.collections || [],
    covers: _book.covers || [], 
    description: _book.description || '', 
    edition_num: _book.edition_num || 0, 
    format: _book.format || '', 
    genres: _book.genres || [], 
    incipit: _book.incipit || '',
    languages: _book.languages || [], 
    pages_num: _book.pages_num || 0, 
    publisher: _book.publisher || '', 
    publication: _book.publication || '', 
    readers_num: _book.readers_num || 0,
    rating_num: _book.rating_num || 0,
    ratings_num: _book.ratings_num || 0,
    reviews_num: _book.reviews_num || 0,
    subtitle: _book.subtitle || '', 
    title: _book.title || '', 
    title_sort: _book.title_sort || '',
    trailerURL: _book.trailerURL || ''
  });
  const [changes, setChanges] = useState([]);
  const [errors, setErrors] = useState({});
  const [imgLoading, setImgLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgProgress, setImgProgress] = useState(0);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingIncipit, setIsEditingIncipit] = useState(false);
  const [isOpenChangesDialog, setIsOpenChangesDialog] = useState(false);
  const [leftChars, setLeftChars] = useState({ description: null, incipit: null });
  const [loading, setLoading] = useState(false);
  const [prevBook, setPrevBook] = useState(_book);
  const [redirectToBook, setRedirectToBook] = useState(null);
  const is = useRef(true);

  useEffect(() => {
    setPrevBook(book);

    return () => {
      is.current = false;
    }
    // eslint-disable-next-line
  }, []);

  const onToggleDescription = e => {
    e.persist();
    e.preventDefault();

    if (is.current) {
      setIsEditingDescription(isEditingDescription => !isEditingDescription);
    }
  };
  
  const onToggleIncipit = e => {
    e.persist();
    e.preventDefault();
    
    if (is.current) setIsEditingIncipit(isEditingIncipit => !isEditingIncipit);
  };

  const setChange = useCallback((name, value) => {
    const index = changes.indexOf(name);
    const isArray = Array.isArray(value);
    const isObj = typeof value;
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

  const setBookChange = useCallback((name, value) => {
    if (is.current) {
      setBook(book => ({ ...book, [name]: value }));
      setChange(name, value);
      if (errors[name]) setErrors(errors => ({ ...errors, [name]: null }));
    }
  }, [errors, setChange]);

  const onChange = useCallback(e => {
    e.persist();
    const { name, value } = e.target;
    setBookChange(name, value);
  }, [setBookChange]);

  const onChangeNumber = useCallback(e => {
    e.persist();
    const { name, value } = e.target;
    const value_num = parseInt(value, 10);

    const match = value.match(numRegex);

    setBookChange(name, value_num);

    if (match) {
      setErrors(errors => ({ ...errors, [name]: null }));
    } else {
      setErrors(errors => ({ ...errors, [name]: 'Numero non valido' }));
    }
  }, [setBookChange]);

  const onChangeSelect = useCallback(name => e => {
    e.persist();
    const { value } = e.target;
    setBookChange(name, value);
  }, [setBookChange]);

  const onChangeDate = useCallback(name => date => {
    const value = String(date);
    setBookChange(name, value);
  }, [setBookChange]);

  const onAddChip = useCallback((name, chip) => {
    const value = [...book[name], chip];
    setBookChange(name, value);
  }, [book, setBookChange]);

  const onDeleteChip = useCallback((name, chip) => {
    const value = book[name].filter(c => c !== chip);
    setBookChange(name, value);
  }, [book, setBookChange]);
  
  const onAddChipToObj = useCallback((name, chip) => {
    const value = { ...book[name], [chip.split('.').join('')]: true };
    setBookChange(name, value)
  }, [book, setBookChange]);

  const onDeleteChipFromObj = useCallback((name, chip) => {
    const value = arrToObj(Object.keys(book[name]).filter(c => c !== chip.split('.').join('')), item => ({ key: item, value: true }));
    setBookChange(name, value);
  }, [book, setBookChange]);
  
  const onChangeMaxChars = useCallback(e => {
    e.persist();
    const { name, value } = e.target;

    if (is.current) {
      setBookChange(name, value);
      setLeftChars(leftChars => ({ ...leftChars, [name]: max.chars[name] - value.length }));
    }
  }, [setBookChange]);

  const onSetDatePickerError = (name, reason) => {
    const errorMessages = {
      disableFuture: "Data futura non valida",
      disablePast: "Data passata non valida",
      invalidDate: "Data non valida",
      minDate: `Data non valida prima del ${new Date(min[name]).toLocaleDateString()}`,
      maxDate: `Data non valida oltre il ${new Date(max[name]).toLocaleDateString()}`
    };
    
    setErrors(errors => ({ ...errors, [name]: errorMessages[reason] }));
  };

  const onPreventDefault = e => { 
    if (e.key === 'Enter') e.preventDefault(); 
  };

  const checkISBNnum = useCallback(async num => {
    const result = await booksRef.where('ISBN_13', '==', Number(num)).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }, [openSnackbar]);

  const validate = useCallback(async book => {
    const errors = {};
    const isDuplicate = await checkISBNnum(book.ISBN_13);
    
    if (!book.title) {
      errors.title = "Inserisci il titolo";
    } else if (book.title.length > max.chars.title) {
      errors.title = `Lunghezza massima ${max.chars.title} caratteri`;
    }

    if (book.subtitle?.length > max.chars.subtitle) {
      errors.subtitle = `Lunghezza massima ${max.chars.subtitle} caratteri`;
    }

    if (!Object.keys(book.authors).length) {
      errors.authors = "Inserisci l'autore";
    } else if (Object.keys(book.authors).length > max.items.authors) {
      errors.authors = `Massimo ${max.items.authors} autori`;
    } else if (Object.keys(book.authors).some(author => author.length > max.chars.author)) {
      errors.authors = `Lunghezza massima ${max.chars.author} caratteri`;
    }

    if (!book.publisher) {
      errors.publisher = "Inserisci l'editore";
    } else if (book.publisher.length > max.chars.publisher) {
      errors.publisher = `Lunghezza massima ${max.chars.publisher} caratteri`;
    }

    if (!book.pages_num) {
      errors.pages_num = "Inserisci le pagine";
    } else if (String(book.pages_num).length > max.chars.pages_num) {
      errors.pages_num = `Lunghezza massima ${max.chars.pages_num} cifre`;
    } else if (book.pages_num < min.items.pages_num) {
      errors.pages_num = `Minimo ${min.items.pages_num} pagine`;
    }

    if (!book.ISBN_13) {
      errors.ISBN_13 = "Inserisci il codice ISBN";
    } else if (String(book.ISBN_13).length !== 13) {
      errors.ISBN_13 = "Il codice deve contenere 13 cifre";
    } else if (String(book.ISBN_13).substring(0,3) !== "978") {
      if (String(book.ISBN_13).substring(0,3) !== "979") {
        errors.ISBN_13 = "Il codice deve iniziare per 978 o 979";
      }
    } else if (!isISBN(String(book.ISBN_13), 13)) {
      errors.ISBN_13 = "Codice non valido";
    } else if (!_book.bid && isDuplicate) {
      errors.ISBN_13 = "Libro già presente";
    }

    if (book.ISBN_10) {
      if (String(book.ISBN_10).length !== 10) {
        errors.ISBN_10 = "Il codice deve essere composto da 10 cifre";
      } else if (!isISBN(String(book.ISBN_10), 10)) {
        errors.ISBN_10 = "Codice non valido";
      }
    } 

    if (new Date(book.publication).getTime() > max.publication) {
      errors.publication = "Data di pubblicazione non valida";
    }

    if (book.edition_num) {
      if (book.edition_num < 1) {
        errors.edition_num = "Numero non valido";
      } else if (String(book.edition_num).length > max.chars.edition_num) {
        errors.edition_num = `Max ${max.chars.edition_num} cifre`;
      }
    }

    if (book.languages?.length > max.items.languages) {
      errors.languages = `Massimo ${max.items.languages} lingue`;
    }

    if (book.awards?.length > max.items.awards) {
      errors.awards = `Massimo ${max.items.awards} premi`;
    }

    if (book.genres?.length > max.items.genres) {
      errors.genres = `Massimo ${max.items.genres} generi`;
    }

    if (book.collections) {
      if (book.collections.length > max.items.collections) {
        errors.collections = `Massimo ${max.items.collections} collezioni`;
      }
      if (book.collections.some(collection => collection.length > max.chars.collection)) {
        errors.collections = `Lunghezza massima ${max.chars.collection} caratteri`;
      }
    }

    if (book.description) {
      if (book.description.length < min.chars.description) {
        errors.description = `Lunghezza minima ${min.chars.description} caratteri`;
        if (is.current) setIsEditingDescription(true);
      } else if (book.description.length > max.chars.description) {
        errors.description = `Lunghezza massima ${max.chars.description} caratteri`;
        if (is.current) setIsEditingDescription(true);
      }
    }

    if (book.incipit) {
      if (book.incipit.length < min.chars.incipit) {
        errors.incipit = `Lunghezza minima ${min.chars.incipit} caratteri`;
        if (is.current) setIsEditingIncipit(true);
      } else if (book.incipit.length > max.chars.incipit) {
        errors.incipit = `Lunghezza massima ${max.chars.incipit} caratteri`;
        if (is.current) setIsEditingIncipit(true);
      }
    }

    if (book.trailerURL) {
      if (!isURL(book.trailerURL)) {
        errors.trailerURL = `Formato URL non valido`;
      } 
      if (book.trailerURL.length > max.chars.URL) {
        errors.trailerURL = `Lunghezza massima ${max.chars.URL} caratteri`;
      }
    }

    ['description', 'publisher', 'subtitle', 'title'].forEach(text => {
      const urlMatches = extractUrls(book[text]);
      const badWords = checkBadWords(book[text]);
      if (urlMatches) {
        errors[text] = `Non inserire link (${join(urlMatches)})`;
      } else if (badWords) {
        errors[text] = "Niente volgarità";
      }
    });
    
    return errors;
  }, [checkISBNnum, _book]);

	const onImageChange = useCallback(e => {
    e.preventDefault();
		const file = e.target.files[0];

    if (file) {
      const uploadError = validateImg(file, 1);
      
      if (!uploadError) {
        if (is.current) {
          setImgLoading(true);
          setErrors(errors => ({ ...errors, upload: null }));
        }
        const uploadTask = storageRef.child(`books/${_book.bid || book.bid}/cover`).put(file);
        const unsubUploadTask = uploadTask.on('state_changed', snap => {
          if (is.current) { 
            setImgProgress(snap.bytesTransferred / snap.totalBytes * 100);
          }
        }, err => {
          // console.warn(`upload error: ${error.message}`);
          if (is.current) { 
            setErrors(errors => ({ ...errors, upload: err.message }));
            setImgLoading(false);
            setImgProgress(0);
            openSnackbar(err.message, 'error')
          }
        }, () => {
          // console.log('upload completed');
          uploadTask.then(snap => 
            snap.ref.getDownloadURL().then(url => {
              const name = 'covers';
              const value = [url];
              
              if (is.current) {
                setImgLoading(false);
                setImgPreview(url);
                setBookChange(name, value);
                openSnackbar('Immagine caricata', 'success');
                setTimeout(() => {
                  if (is.current) setImgProgress(0);
                }, 2000);
              }
            })
          );
          unsubUploadTask();
        });
      } else if (is.current) {
        setErrors(errors => ({ ...errors, upload: uploadError }));
        openSnackbar(uploadError, 'error');
      }
    }
  }, [book, openSnackbar, _book, setBookChange]);
  
  const onSubmit = useCallback(async e => {
    e.preventDefault();

    if (changes.length || !book.bid) {
      if (is.current) setLoading(true);

      const errors = await validate(book);

      if (is.current) setErrors(errors);

      if (Object.keys(errors).length === 0) {
        let newBid = '';
        const bookCover = book.covers[0];
        const userUid = user?.uid || '';
        const userDisplayName = user?.displayName || '';

        if (_book.bid) {
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
          }).then(() => {
            if (is.current) {
              setChanges([]);
              onEditing();
              openSnackbar('Modifiche salvate', 'success');
            }
          }).catch(err => {
            if (is.current) {
              openSnackbar(handleFirestoreError(err), 'error');
            }
          }).finally(() => {
            if (is.current) setLoading(false);
          });
        } else {
          const newBookRef = booksRef.doc();
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
          }).then(() => {
            if (is.current) {
              setRedirectToBook(`${newBid}/${book.title}`)
              // setLoading(false);
              // setChanges([]);
              // onEditing();
              openSnackbar('Nuovo libro creato', 'success');
              // console.log(`New book created with bid ${newBid}`);
            }
          }).catch(err => {
            if (is.current) {
              setLoading(false);
              openSnackbar(handleFirestoreError(err), 'error');
            }
          });
        }
        if (book.collections) {
          book.collections.forEach(cid => {
            collectionRef(cid, book.bid || newBid).get().then(collection => {
              if (collection.exists) { 
                collectionBookRef(cid, book.bid || newBid).get().then(collectionBook => {
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
                  }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
                }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
              } else {
                collectionRef(cid).set({
                  title: cid,
                  books_num: 0,
                  description: '',
                  edit: true,
                  genres: book.genres
                }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
              }
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          });
        }
      } else if (is.current) {
        setLoading(false);
        if (errors.description) setIsEditingDescription(true)
        if (errors.incipit) setIsEditingIncipit(true)
        openSnackbar('Ricontrolla i dati inseriti', 'error');
      }
    } else onEditing();
  }, [book, changes, imgPreview, onEditing, openSnackbar, _book, user, validate]);

  const onExitEditing = useCallback(() => {
    if (changes.length) {
      if (is.current) setIsOpenChangesDialog(true);
    } else onEditing();
  }, [changes, onEditing]);

  const onCloseChangesDialog = () => setIsOpenChangesDialog(false);
  
  const menuItemsMap = (arr, values) => arr.map(item => 
    <MenuItem 
      value={item.name} 
      key={item.id} 
      // insetChildren={Boolean(values)} 
      checked={values ? values.includes(item.name) : false}>
      {item.name}
    </MenuItem>
  );
  
  if (redirectToBook) return <Redirect to={`/book/${redirectToBook}`} />
  
  return (
    <>
      <div className="container top" ref={is}>
        <form className="card light">
          {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
          <div className="container md">
            <div className={`edit-book-cover ${errors.upload ? 'error' : ''} ${setFormatClass(book.format)}-format`}>
              <Cover book={book} loading={imgLoading} />
              {isAdmin && book.bid && (
                <button type="button" className={`btn sm centered rounded ${imgProgress === 100 ? 'success' : 'flat'}`}>
                  <input type="file" accept="image/*" className="upload" onChange={onImageChange} />
                  {
                    // imgProgress > 0 && <progress type="progress" value={imgProgress} max="100" />
                  }
                  <span>{imgProgress === 100 ? 'Immagine caricata' : `Carica un'immagine`}</span>
                </button>
              )}
            </div>
            <div className="edit-book-info">
              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.title)} htmlFor="title">Titolo</InputLabel>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="es: Sherlock Holmes"
                    error={Boolean(errors.title)}
                    value={book.title || ''}
                    onChange={onChange}
                  />
                  {errors.title && <FormHelperText className="message error">{errors.title}</FormHelperText>}
                </FormControl>
              </div>
              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.subtitle)} htmlFor="subtitle">Sottotitolo</InputLabel>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    type="text"
                    placeholder="es: Uno studio in rosso"
                    error={Boolean(errors.subtitle)}
                    value={book.subtitle || ''}
                    onChange={onChange}
                  />
                  {errors.subtitle && <FormHelperText className="message error">{errors.subtitle}</FormHelperText>}
                </FormControl>
              </div>
              <div className="form-group">
                <FormControl className="chip-input" margin="normal" fullWidth>
                  <ChipInput
                    id="authors"
                    name="authors"
                    label="Autore"
                    placeholder="es: Arthur Conan Doyle"
                    blurBehavior="add"
                    error={Boolean(errors.authors)}
                    value={Object.keys(book.authors)}
                    onAdd={chip => onAddChipToObj("authors", chip)}
                    onDelete={chip => onDeleteChipFromObj("authors", chip)}
                    onKeyPress={e => onPreventDefault(e)}
                  />
                  <FormHelperText className={`message ${errors.authors ? 'error' : ''}`}>
                    {errors.authors || 'Premi invio per confermare'}
                  </FormHelperText>
                </FormControl>
              </div>
              <div className="row">
                <div className="form-group col-sm-6">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.ISBN_13)} htmlFor="ISBN_13">ISBN-13</InputLabel>
                    <Input
                      id="ISBN_13"
                      name="ISBN_13"
                      type="number"
                      placeholder="es: 9788854152601"
                      error={Boolean(errors.ISBN_13)}
                      value={Number(book.ISBN_13)}
                      onChange={onChangeNumber}
                    />
                    {errors.ISBN_13 && <FormHelperText className="message error">{errors.ISBN_13}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="form-group col-sm-6">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.ISBN_10)} htmlFor="ISBN_10">ISBN-10</InputLabel>
                    <Input
                      id="ISBN_10"
                      name="ISBN_10"
                      type="text"
                      placeholder="es: 8854152609"
                      error={Boolean(errors.ISBN_10)}
                      value={book.ISBN_10}
                      onChange={onChange}
                    />
                    {errors.ISBN_10 && <FormHelperText className="message error">{errors.ISBN_10}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-8">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.publisher)} htmlFor="publisher">Editore</InputLabel>
                    <Input
                      id="publisher"
                      name="publisher"
                      type="text"
                      placeholder="es: Newton Compton (Live)"
                      error={Boolean(errors.publisher)}
                      value={book.publisher}
                      onChange={onChange}
                    />
                    {errors.publisher && <FormHelperText className="message error">{errors.publisher}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="form-group col-4">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.pages_num)} htmlFor="pages_num">Pagine</InputLabel>
                    <Input
                      id="pages_num"
                      name="pages_num"
                      type="number"
                      placeholder="es: 128"
                      error={Boolean(errors.pages_num)}
                      value={Number(book.pages_num)}
                      onChange={onChangeNumber}
                    />
                    {errors.pages_num && <FormHelperText className="message error">{errors.pages_num}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-8">
                  <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale="it">
                    <DatePicker
                      className="date-picker"
                      name="publication"
                      cancelLabel="Annulla"
                      leftArrowIcon={icon.chevronLeft}
                      rightArrowIcon={icon.chevronRight}
                      inputFormat="DD/MM/YYYY"
                      // disableFuture
                      minDate={min.publication}
                      maxDate={max.publication}
                      error={Boolean(errors.publication)}
                      label="Data di pubblicazione"
                      value={book.publication ? new Date(book.publication) : null}
                      onChange={onChangeDate("publication")}
                      onError={reason => onSetDatePickerError('publication', reason)}
                      autoOk
                      clearable
                      renderInput={props => (
                        <TextField {...props} margin="normal" fullWidth helperText={errors.publication} />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                <div className="form-group col-4">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.edition_num)} htmlFor="edition_num">Edizione</InputLabel>
                    <Input
                      id="edition_num"
                      className="spin-buttons"
                      name="edition_num"
                      type="number"
                      placeholder="es: 1"
                      error={Boolean(errors.edition_num)}
                      value={Number(book.edition_num)}
                      onChange={onChangeNumber}
                    />
                    {errors.edition_num && <FormHelperText className="message error">{errors.edition_num}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-sm-8">
                  <FormControl className="select-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.languages)} htmlFor="languages">Lingua</InputLabel>
                    <Select
                      id="languages"
                      error={Boolean(errors.languages)}
                      value={book.languages}
                      onChange={onChangeSelect("languages")}
                      multiple>
                      {menuItemsMap(languages, book.languages)}
                    </Select>
                    {errors.languages && <FormHelperText className="message error">{errors.languages}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="form-group col-sm-4">
                  <FormControl className="select-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.format)} htmlFor="format">Formato</InputLabel>
                    <Select
                      id="format"
                      error={Boolean(errors.format)}
                      value={book.format}
                      onChange={onChangeSelect("format")}>
                      {menuItemsMap(formats, book.format)}
                    </Select>
                    {errors.format && <FormHelperText className="message error">{errors.format}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
              <div className="form-group">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.genres)} htmlFor="genres">Genere (max 3)</InputLabel>
                  <Select
                    id="genres"
                    placeholder="es: Giallo, Thriller"
                    error={Boolean(errors.genres)}
                    value={book.genres}
                    onChange={onChangeSelect("genres")}
                    multiple>
                    {menuItemsMap(genres, book.genres)}
                  </Select>
                  {errors.sex && <FormHelperText className="message error">{errors.sex}</FormHelperText>}
                </FormControl>
              </div>
              {isAdmin && (
                <>
                  <div className="form-group">
                    <FormControl className="chip-input" margin="normal" fullWidth>
                      <ChipInput
                        name="collections"
                        label="Collezione (max 5)"
                        placeholder="es: Sherlock Holmes"
                        blurBehavior="add"
                        error={Boolean(errors.collections)}
                        value={book.collections}
                        onAdd={chip => onAddChip("collections", chip)}
                        onDelete={chip => onDeleteChip("collections", chip)}
                        disabled={!isAdmin}
                        onKeyPress={e => onPreventDefault(e)}
                      />
                      {errors.collections && <FormHelperText className="message error">{errors.collections}</FormHelperText>}
                    </FormControl>
                  </div>
                  <div className="form-group">
                    <FormControl className="input-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.trailerURL)} htmlFor="trailerURL">Video trailer</InputLabel>
                      <Input
                        id="trailerURL"
                        name="trailerURL"
                        type="url"
                        placeholder="es: https://www.youtube.com/..."
                        error={Boolean(errors.trailerURL)}
                        value={book.trailerURL}
                        disabled={!isAdmin}
                        onChange={onChange}
                      />
                      {errors.trailerURL && <FormHelperText className="message error">{errors.trailerURL}</FormHelperText>}
                    </FormControl>
                  </div>

                  <div className="form-group">
                    <FormControl className="select-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.awards)} htmlFor="awards">Premi vinti</InputLabel>
                      <Select
                        id="awards"
                        error={Boolean(errors.awards)}
                        value={book.awards}
                        onChange={onChangeSelect("awards")}
                        multiple>
                        {menuItemsMap(awards, book.awards)}
                      </Select>
                      {errors.awards && <FormHelperText className="message error">{errors.awards}</FormHelperText>}
                    </FormControl>
                  </div>
                </>
              )}
              {isEditingDescription ? (
                <div className="form-group">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.description)} htmlFor="description">Descrizione</InputLabel>
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      placeholder={`Inserisci una descrizione (max ${max.chars.description} caratteri)...`}
                      error={Boolean(errors.description)}
                      value={book.description}
                      onChange={onChangeMaxChars}
                      rowsMax={30}
                      multiline
                    />
                    {errors.description && <FormHelperText className="message error">{errors.description}</FormHelperText>}
                    {leftChars.description !== null && (
                      <FormHelperText className={`message ${(leftChars.description < 0) ? 'warning' : 'neutral'}`}>
                        Caratteri rimanenti: {leftChars.description}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              ) : (
                <div className="info-row">
                  <button type="button" className="btn flat rounded centered" onClick={onToggleDescription}>
                    {book.description ? 'Modifica la descrizione' : 'Aggiungi una descrizione'}
                  </button>
                </div>
              )}
              {isEditingIncipit ? (
                <div className="form-group">
                  <FormControl className="input-field" margin="normal" fullWidth>
                    <InputLabel error={Boolean(errors.incipit)} htmlFor="incipit">Incipit</InputLabel>
                    <Input
                      id="incipit"
                      name="incipit"
                      type="text"
                      placeholder={`Inserisci i primi paragrafi (max ${max.chars.incipit} caratteri)...`}
                      error={Boolean(errors.incipit)}
                      value={book.incipit || ''}
                      onChange={onChangeMaxChars}
                      rowsMax={30}
                      multiline
                    />
                    {errors.incipit && <FormHelperText className="message error">{errors.incipit}</FormHelperText>}
                    {leftChars.incipit !== null && (
                      <FormHelperText className={`message ${(leftChars.incipit < 0) ? 'warning' : 'neutral'}`}>
                        Caratteri rimanenti: {leftChars.incipit}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              ) : (
                <div className="info-row">
                  <button type="button" className="btn flat rounded centered" onClick={onToggleIncipit}>
                    {book.incipit ? "Modifica l'incipit" : "Aggiungi un incipit"}
                  </button>
                </div>
              )}

            </div>
          </div>
          <div className="footer no-gutter">
            <button type="button" onClick={onSubmit} className="btn btn-footer primary">{book.bid ? 'Salva le modifiche' : 'Crea scheda libro'}</button>
          </div>
        </form>
        {book.bid && (
          <div className="form-group">
            <button type="button" onClick={onExitEditing} className="btn flat rounded centered">Annulla</button>
          </div>
        )}
      </div>

      {isOpenChangesDialog && (
        <Dialog
          open={isOpenChangesDialog}
          keepMounted
          onClose={onCloseChangesDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Ci sono modifiche non salvate</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Vuoi salvarle prima di uscire?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={onEditing}>Esci</button>
            <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

BookForm.propTypes = {
  book: bookType.isRequired,
  onEditing: funcType.isRequired
}
 
export default BookForm;