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
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import isbn from 'isbn-utils';
import ChipInput from 'material-ui-chip-input';
import moment from 'moment';
import 'moment/locale/it';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import isISBN from 'validator/lib/isISBN';
import isURL from 'validator/lib/isURL';
import firebase, { authid, bookRef, booksRef, collectionBookRef, collectionRef, storageRef } from '../../config/firebase';
import icon from '../../config/icons';
import { formats, genres, languages } from '../../config/lists';
import { arrToObj, checkBadWords, handleFirestoreError, hasRole, normalizeString, validateImg } from '../../config/shared';
import { bookType, funcType, userType } from '../../config/types';
import Cover from '../cover';

export default class BookForm extends Component {
	state = {
    book: {
      ISBN_10: this.props.book.ISBN_10 || (this.props.book.ISBN_13 ? isbn.parse(this.props.book.ISBN_13) ? isbn.parse(this.props.book.ISBN_13).asIsbn10() : 0 : 0), 
      ISBN_13: this.props.book.ISBN_13 || 0, 
      EDIT: this.props.book.EDIT || {
        createdBy: this.props.book.createdBy || '',
        createdByUid: this.props.book.createdByUid || '',
        created_num: this.props.book.created || 0,
        edit: true,
        lastEditBy: this.props.book.lastEditBy || '',
        lastEditByUid: this.props.book.lastEditByUid || '',
        lastEdit_num: this.props.book.lastEdit || 0
      },
      authors: this.props.book.authors || {}, 
      bid: this.props.book.bid || '', 
      collections: this.props.book.collections || [],
      covers: this.props.book.covers || [], 
      description: this.props.book.description || '', 
      edition_num: this.props.book.edition_num || 0, 
      format: this.props.book.format || '', 
      genres: this.props.book.genres || [], 
      incipit: this.props.book.incipit || '',
      languages: this.props.book.languages || [], 
      pages_num: this.props.book.pages_num || 0, 
      publisher: this.props.book.publisher || '', 
      publication: this.props.book.publication || '', 
      readers_num: this.props.book.readers_num || 0,
      rating_num: this.props.book.rating_num || 0,
      ratings_num: this.props.book.ratings_num || 0,
      reviews_num: this.props.book.reviews_num || 0,
      subtitle: this.props.book.subtitle || '', 
      title: this.props.book.title || '', 
      title_sort: this.props.book.title_sort || '',
      trailerURL: this.props.book.trailerURL || ''
    },
    imgLoading: false,
    imgPreview: null,
    imgProgress: 0,
    isEditingDescription: false,
    isEditingIncipit: false,
    isOpenChangesDialog: false,
    description_maxChars: 2000,
    incipit_maxChars: 2500,
    URL_maxChars: 1000,
    loading: false,
    errors: {},
    changes: false,
    prevBook: this.props.book,
    redirectToBook: null
  }

  static propTypes = {
    book: bookType.isRequired,
    isEditing: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    user: userType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if ((props.book.bid !== state.book.bid) || (!state.book.bid && props.book !== state.prevBook)) { 
      return { prevBook: props.book, book: props.book, errors: {} }
    }
    return null;
  }

  componentDidMount(/* props */) {
    this._isMounted = true;
    /* if (this.props.book.bid) {
      bookRef(this.props.book.bid).onSnapshot(snap => {
        if (this._isMounted) {
          this.setState({ book: snap.data() });
        }
      });
    } */
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  onToggleDescription = e => {
    e.persist();
    e.preventDefault();

    if (this._isMounted) {
      this.setState(prevState => ({
        isEditingDescription: !prevState.isEditingDescription
      }));
    }
  }
  
  onToggleIncipit = e => {
    e.persist(); // TODO: check if needed
    e.preventDefault();
    
    if (this._isMounted) {
      this.setState(prevState => ({
        isEditingIncipit: !prevState.isEditingIncipit
      }));
    }
  }
  
  isChanged = (name, value) => {
    const prevValue = this.state.prevBook[name];

    if (prevValue !== value) {
      if (this._isMounted) {
        this.setState({ changes: true });
      }
    }
  }

  onChange = e => {
    e.persist();
    const { name, value } = e.target;

    if (this._isMounted) {
      this.setState(prevState => ({
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
    
  };

  onChangeNumber = e => {
    e.persist();
    const { name } = e.target;
    const value = parseInt(e.target.value, 10);

    if (!Number.isNaN(value)) {
      if (this._isMounted) {
        this.setState(prevState => ({
          book: { ...prevState.book, [name]: value }
        }), () => this.isChanged(name, value));
      }
    }
  };

  onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (this._isMounted) {
      this.setState(prevState => ({ 
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
  };

  onChangeDate = name => date => {
    const value = String(date);

    if (this._isMounted) {
      this.setState(prevState => ({ 
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
  };

  onAddChip = (name, chip) => {
    const prevState = this.state;
    const value = [...prevState.book[name], chip];

    if (this._isMounted) {
      this.setState(prevState => ({ 
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value)); 
    }
  }; 

  onDeleteChip = (name, chip) => { 
    const prevState = this.state;
    const value = prevState.book[name].filter((c) => c !== chip);

    if (this._isMounted) {
      this.setState(prevState => ({ 
        // chips: prevState.chips.filter((c) => c !== chip) 
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
  }; 
  
  onAddChipToObj = (name, chip) => {
    const prevState = this.state;
    const value = { ...prevState.book[name], [chip.split('.').join('')]: true };

    if (this._isMounted) {
      this.setState(prevState => ({
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
  };

  onDeleteChipFromObj = (name, chip) => {
    const prevState = this.state;
    const value = arrToObj(Object.keys(prevState.book[name]).map(arr => arr).filter((c) => c !== chip.split('.').join('')), item => ({ name: item, value: true }));

    if (this._isMounted) {
      this.setState(prevState => ({
        // chips: prevState.chips.filter((c) => c !== chip)
        book: { ...prevState.book, [name]: value }
      }), () => this.isChanged(name, value));
    }
  };
  
  onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    const leftChars = `${name}_leftChars`;
    const maxChars = `${name}_maxChars`;
      
    if (this._isMounted) {
      this.setState(prevState => ({
        book: { ...prevState.book, [name]: value }, 
        [leftChars]: prevState[maxChars] - value.length, 
        changes: true
      }), () => this.isChanged(name, value));
    }
  };

  onPreventDefault = e => { 
    if (e.key === 'Enter') e.preventDefault(); 
  }

  checkISBNnum = async num => {
    const { openSnackbar } = this.props;
    const result = await booksRef.where('ISBN_13', '==', Number(num)).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }

  validate = async book => {
    const errors = {};
    const isDuplicate = await this.checkISBNnum(book.ISBN_13);
    const maxPublication = new Date(new Date().setMonth(new Date().getMonth() + 1));
    
    if (!book.title) {
      errors.title = "Inserisci il titolo";
    } else if (book.title.length > 255) {
      errors.title = "Lunghezza massima 255 caratteri";
    }
    if (book.subtitle && book.subtitle.length > 255) {
      errors.subtitle = "Lunghezza massima 255 caratteri";
    }
    if (!Object.keys(book.authors).length) {
      errors.authors = "Inserisci l'autore";
    } else if (Object.keys(book.authors).length > 5) {
      errors.authors = "Massimo 5 autori";
    } else if (Object.keys(book.authors).some(author => author.length > 50)) {
      errors.authors = "Lunghezza massima 50 caratteri";
    }
    if (!book.publisher) {
      errors.publisher = "Inserisci l'editore";
    } else if (book.publisher.length > 100) {
      errors.publisher = "Lunghezza massima 100 caratteri";
    }
    if (!book.pages_num) {
      errors.pages_num = "Inserisci le pagine";
    } else if (String(book.pages_num).length > 5) {
      errors.pages_num = "Lunghezza massima 5 cifre";
    } else if (book.pages_num < 20) {
      errors.pages_num = "Minimo 20 pagine";
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
    } else if (!this.props.book.bid && isDuplicate) {
      errors.ISBN_13 = "Libro già presente";
    }
    if (book.ISBN_10 && (String(book.ISBN_10).length !== 10)) {
      errors.ISBN_10 = "Il codice deve essere composto da 10 cifre";
    } else if (book.ISBN_10 && !isISBN(String(book.ISBN_10), 10)) {
      errors.ISBN_10 = "Codice non valido";
    }
    if (new Date(book.publication).getTime() > maxPublication) {
      errors.publication = "Data di pubblicazione non valida";
    }
    if (book.edition_num && book.edition_num < 1) {
      errors.edition_num = "Numero non valido";
    } else if (book.edition_num && book.edition_num.toString().length > 2) {
      errors.edition_num = "Max 2 cifre";
    }
    if (book.languages && (book.languages.length > 4)) {
      errors.languages = "Massimo 4 lingue";
    }
    if (book.genres && (book.genres.length > 3)) {
      errors.genres = "Massimo 3 generi";
    }
    if (book.collections) {
      if (book.collections.length > 5) {
        errors.collections = "Massimo 5 collezioni";
      }
      if (book.collections.some(collection => collection.length > 50)) {
        errors.collections = "Lunghezza massima 50 caratteri";
      }
    }
    if (book.description && book.description.length < 100) {
      errors.description = `Lunghezza minima 100 caratteri`;
      if (this._isMounted) { this.setState({ isEditingDescription: true }) }
    }
    if (book.description && book.description.length > this.state.description_maxChars) {
      errors.description = `Lunghezza massima ${this.state.description_maxChars} caratteri`;
      if (this._isMounted) { this.setState({ isEditingDescription: true }) }
    }
    if (book.incipit && book.incipit.length < 255) {
      errors.incipit = `Lunghezza minima 255 caratteri`;
      if (this._isMounted) { this.setState({ isEditingIncipit: true }) }
    }
    if (book.incipit && book.incipit.length > this.state.incipit_maxChars) {
      errors.incipit = `Lunghezza massima ${this.state.incipit_maxChars} caratteri`;
      if (this._isMounted) { this.setState({ isEditingIncipit: true }) }
    }
    if (book.trailerURL) {
      if (!isURL(book.trailerURL)) {
        errors.trailerURL = `Formato URL non valido`;
      } 
      if (book.trailerURL.length > this.state.URL_maxChars) {
        errors.trailerURL = `Lunghezza massima ${this.state.URL_maxChars} caratteri`;
      }
    } 
    ['description', 'publisher', 'subtitle', 'title'].forEach(text => {
      if (checkBadWords(book[text])) errors[text] = "Niente volgarità"
    });
    return errors;
  }

	onImageChange = e => {
    e.preventDefault();
		const file = e.target.files[0];

    if (file) {
      const { openSnackbar } = this.props;
      const error = validateImg(file, 1);
      
      if (!error) {
        if (this._isMounted) {
          this.setState(prevState => ({ 
            imgLoading: true, 
            errors: { ...prevState.errors, upload: null } 
          }));
        }
        const uploadTask = storageRef(`books/${this.props.book.bid || this.state.book.bid}`, 'cover').put(file);
        const unsubUploadTask = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, snap => {
          if (this._isMounted) { 
            this.setState({ imgProgress: snap.bytesTransferred / snap.totalBytes * 100 });
          }
        }, err => {
          // console.warn(`upload error: ${error.message}`);
          if (this._isMounted) { 
            this.setState(prevState => ({ 
              errors: { ...prevState.errors, upload: err.message }, 
              imgLoading: false,
              imgProgress: 0
            }), () => openSnackbar(err.message, 'error'));
          }
        }, () => {
          // console.log('upload completed');
          uploadTask.then(snap => 
            snap.ref.getDownloadURL().then(url => {
              const name = 'covers';
              const value = [url];
              
              if (this._isMounted) {
                this.setState(prevState => ({
                  imgLoading: false,
                  imgPreview: url,
                  book: { ...prevState.book, covers: value }
                }), () => {
                  this.isChanged(name, value);
                  openSnackbar('Immagine caricata', 'success');
                  setTimeout(() => {
                    if (this._isMounted) this.setState({ imgProgress: 0 });
                  }, 2000);
                })
              }
            })
          );
          unsubUploadTask();
        });
      } else if (this._isMounted) {
        this.setState(prevState => ({ 
          errors: { ...prevState.errors, upload: error } 
        }), () => openSnackbar(error, 'error'));
      }
    }
  };
  
  onSubmit = async e => {
    e.preventDefault();
    const { book, changes, imgPreview } = this.state;
    const { openSnackbar } = this.props;

    if (changes || !book.bid) {
      const errors = await this.validate(book);
      if (this._isMounted) this.setState({ errors, loading: true });
      if (Object.keys(errors).length === 0) {
        let newBid = '';
        if (this.props.book.bid) {
          const { covers, EDIT, title_sort, ...restBook } = book;
          bookRef(this.props.book.bid).set({
            ...restBook,
            covers: (imgPreview && Array(imgPreview)) || book.covers,
            title_sort: normalizeString(book.title) || book.title_sort,
            EDIT: {
              ...EDIT,
              lastEdit_num: Number((new Date()).getTime()),
              lastEditBy: (this.props.user && this.props.user.displayName) || '',
              lastEditByUid: authid || ''
            }
          }).then(() => {
            if (this._isMounted) {
              this.setState({ loading: false, changes: false }, () => {
                this.props.isEditing();
                openSnackbar('Modifiche salvate', 'success');
              });
            }
          }).catch(err => {
            if (this._isMounted) {
              this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error'));
            }
          });
        } else {
          const newBookRef = booksRef.doc();
          newBid = newBookRef.id;
          newBookRef.set({
            ISBN_10: book.ISBN_10,
            ISBN_13: book.ISBN_13, 
            authors: book.authors, 
            bid: newBid,
            collections: book.collections,
            covers: (imgPreview && Array(imgPreview)) || book.covers, 
            description: book.description, 
            EDIT: {
              created_num: Number((new Date()).getTime()),
              createdBy: (this.props.user && this.props.user.displayName) || '',
              createdByUid: authid || '',
              edit: true,
              lastEdit_num: Number((new Date()).getTime()),
              lastEditBy: (this.props.user && this.props.user.displayName) || '',
              lastEditByUid: authid || ''
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
            trailerURL: book.trailerURL
          }).then(() => {
            if (this._isMounted) {
              this.setState({ redirectToBook: `${newBid}/${book.title}` }, () => {
                /* this.setState({ loading: false, changes: false });
                this.props.isEditing(); */
                openSnackbar('Nuovo libro creato', 'success');
                // console.log(`New book created with bid ${newBid}`);
              });
            }
          }).catch(err => {
            if (this._isMounted) {
              this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error'));
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
                    covers: (imgPreview && Array(imgPreview)) || (!!book.covers[0] && Array(book.covers[0])) || [],
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
      } else if (this._isMounted) {
        this.setState({ loading: false });
        if (errors.description) { this.setState({ isEditingDescription: true })}
        if (errors.incipit) { this.setState({ isEditingIncipit: true })}
        openSnackbar('Ricontrolla i dati inseriti', 'error');
      }
    } else this.props.isEditing();
  }

  onExitEditing = () => {
    if (this.state.changes) {
      if (this._isMounted) {
        this.setState({ isOpenChangesDialog: true });
      }
    } else this.props.isEditing();
  }

  onCloseChangesDialog = () => this.setState({ isOpenChangesDialog: false });
	
	render() {
    const { book, description_leftChars, description_maxChars, errors, imgLoading, imgProgress, incipit_leftChars, incipit_maxChars, isEditingDescription, isEditingIncipit, isOpenChangesDialog, loading, redirectToBook } = this.state;
    const { isEditing, user } = this.props;
    const isAdmin = hasRole(user, 'admin');
    const maxPublication = new Date(new Date().setMonth(new Date().getMonth() + 1));
    
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
        <div className="content-background"><div className="bg" style={{ backgroundImage: `url(${book.covers[0]})`, }} /></div>
        <div className="container top">
          <form className="card light">
            {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
            <div className="container md">
              <div className={`edit-book-cover ${errors.upload ? 'error' : ''}`}>
                <Cover book={book} loading={imgLoading} />
                {isAdmin && book.bid /* && !book.covers[0] */ && 
                  <button type="button" className={`btn sm centered rounded ${imgProgress === 100 ? 'success' : 'flat'}`}>
                    <input type="file" accept="image/*" className="upload" onChange={this.onImageChange} />
                    {/* imgProgress > 0 && <progress type="progress" value={imgProgress} max="100" className="stepper" /> */}
                    <span>{imgProgress === 100 ? 'Immagine caricata' : `Carica un'immagine`}</span>
                  </button>
                }
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
                      onChange={this.onChange}
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
                      onChange={this.onChange}
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
                      error={Boolean(errors.authors)}
                      value={Object.keys(book.authors)}
                      onAdd={chip => this.onAddChipToObj("authors", chip)}
                      onDelete={chip => this.onDeleteChipFromObj("authors", chip)}
                      onKeyPress={e => this.onPreventDefault(e)}
                    />
                    {errors.authors && <FormHelperText className="message error">{errors.authors}</FormHelperText>}
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
                        onChange={this.onChangeNumber}
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
                        onChange={this.onChange}
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
                        onChange={this.onChange}
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
                        onChange={this.onChangeNumber}
                      />
                      {errors.pages_num && <FormHelperText className="message error">{errors.pages_num}</FormHelperText>}
                    </FormControl>
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-8">
                    <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="it">
                      <DatePicker
                        className="date-picker"
                        name="publication"
                        cancelLabel="Annulla"
                        leftArrowIcon={icon.chevronLeft()}
                        rightArrowIcon={icon.chevronRight()}
                        format="D MMMM YYYY"
                        // disableFuture
                        maxDate={maxPublication}
                        maxDateMessage={<span>Data non valida</span>}
                        error={Boolean(errors.publication)}
                        label="Data di pubblicazione"
                        value={book.publication ? new Date(book.publication) : null}
                        onChange={this.onChangeDate("publication")}
                        margin="normal"
                        animateYearScrolling
                        fullWidth
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  <div className="form-group col-4">
                    <FormControl className="input-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.edition_num)} htmlFor="edition_num">Edizione</InputLabel>
                      <Input
                        id="edition_num"
                        name="edition_num"
                        type="number"
                        placeholder="es: 1"
                        error={Boolean(errors.edition_num)}
                        value={Number(book.edition_num)}
                        onChange={this.onChangeNumber}
                      />
                      {errors.edition_num && <FormHelperText className="message error">{errors.edition_num}</FormHelperText>}
                    </FormControl>
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-sm-6">
                    <FormControl className="select-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.languages)} htmlFor="languages">Lingua</InputLabel>
                      <Select
                        id="languages"
                        error={Boolean(errors.languages)}
                        value={book.languages}
                        onChange={this.onChangeSelect("languages")}
                        multiple>
                        {menuItemsMap(languages, book.languages)}
                      </Select>
                      {errors.languages && <FormHelperText className="message error">{errors.languages}</FormHelperText>}
                    </FormControl>
                  </div>
                  <div className="form-group col-sm-6">
                    <FormControl className="select-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.format)} htmlFor="format">Formato</InputLabel>
                      <Select
                        id="format"
                        error={Boolean(errors.format)}
                        value={book.format}
                        onChange={this.onChangeSelect("format")}>
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
                      onChange={this.onChangeSelect("genres")}
                      multiple>
                      {menuItemsMap(genres, book.genres)}
                    </Select>
                    {errors.sex && <FormHelperText className="message error">{errors.sex}</FormHelperText>}
                  </FormControl>
                </div>
                {isAdmin &&
                  <>
                    <div className="form-group">
                      <FormControl className="chip-input" margin="normal" fullWidth>
                        <ChipInput
                          name="collections"
                          label="Collezione (max 5)"
                          placeholder="es: Sherlock Holmes"
                          error={Boolean(errors.collections)}
                          value={book.collections}
                          onAdd={chip => this.onAddChip("collections", chip)}
                          onDelete={chip => this.onDeleteChip("collections", chip)}
                          disabled={!isAdmin}
                          onKeyPress={e => this.onPreventDefault(e)}
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
                          onChange={this.onChange}
                        />
                        {errors.trailerURL && <FormHelperText className="message error">{errors.trailerURL}</FormHelperText>}
                      </FormControl>
                    </div>
                  </>
                }
                {isEditingDescription /* || book.description */ ?
                  <div className="form-group">
                    <FormControl className="input-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.description)} htmlFor="description">Descrizione</InputLabel>
                      <Input
                        id="description"
                        name="description"
                        type="text"
                        placeholder={`Inserisci una descrizione (max ${description_maxChars} caratteri)...`}
                        error={Boolean(errors.description)}
                        value={book.description}
                        onChange={this.onChangeMaxChars}
                        rowsMax={30}
                        multiline
                      />
                      {errors.description && <FormHelperText className="message error">{errors.description}</FormHelperText>}
                      {(description_leftChars !== undefined) && 
                        <FormHelperText className={`message ${(description_leftChars < 0) ? 'alert' : 'neutral'}`}>
                          Caratteri rimanenti: {description_leftChars}
                        </FormHelperText>
                      }
                    </FormControl>
                  </div>
                :
                  <div className="info-row">
                    <button type="button" className="btn flat rounded centered" onClick={this.onToggleDescription}>
                      {book.description ? 'Modifica la descrizione' : 'Aggiungi una descrizione'}
                    </button>
                  </div>
                }
                {isEditingIncipit /* || book.incipit */ ? 
                  <div className="form-group">
                    <FormControl className="input-field" margin="normal" fullWidth>
                      <InputLabel error={Boolean(errors.incipit)} htmlFor="incipit">Incipit</InputLabel>
                      <Input
                        id="incipit"
                        name="incipit"
                        type="text"
                        placeholder={`Inserisci i primi paragrafi (max ${incipit_maxChars} caratteri)...`}
                        error={Boolean(errors.incipit)}
                        value={book.incipit || ''}
                        onChange={this.onChangeMaxChars}
                        rowsMax={30}
                        multiline
                      />
                      {errors.incipit && <FormHelperText className="message error">{errors.incipit}</FormHelperText>}
                      {(incipit_leftChars !== undefined) && 
                        <FormHelperText className={`message ${(incipit_leftChars < 0) ? 'alert' : 'neutral'}`}>
                          Caratteri rimanenti: {incipit_leftChars}
                        </FormHelperText>
                      }
                    </FormControl>
                  </div>
                :
                  <div className="info-row">
                    <button type="button" className="btn flat rounded centered" onClick={this.onToggleIncipit}>
                      {book.incipit ? "Modifica l'incipit" : "Aggiungi un incipit"}
                    </button>
                  </div>
                }

              </div>
            </div>
            <div className="footer no-gutter">
              <button type="button" onClick={this.onSubmit} className="btn btn-footer primary">{book.bid ? 'Salva le modifiche' : 'Crea scheda libro'}</button>
            </div>
          </form>
          {book.bid && 
            <div className="form-group">
              <button type="button" onClick={this.onExitEditing} className="btn flat rounded centered">Annulla</button>
            </div>
          }
        </div>

        <Dialog
          open={isOpenChangesDialog}
          keepMounted
          onClose={this.onCloseChangesDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Ci sono delle modifiche non salvate</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Vuoi salvarle prima di uscire?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={isEditing}>Esci</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Salva</button>
          </DialogActions>
        </Dialog>
      </>
		);
	}
}