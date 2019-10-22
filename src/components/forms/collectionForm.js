import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React from 'react';
import { collectionRef, collectionsRef } from '../../config/firebase';
import { genres } from '../../config/lists';
import { handleFirestoreError } from '../../config/shared';
import { funcType, stringType, userType } from '../../config/types';
import Overlay from '../overlay';

export default class collectionForm extends React.Component {
	state = {
    data: {
      books_num: 0,
      description: '',
      edit: true,
      genres: [],
      title: ''
    },
    desc_maxChars: 1000,
    desc_minChars: 50,
    loading: false,
    changes: false,
    errors: {},
    authError: ''
  }

  static propTypes = {
    onToggle: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    id: stringType,
    user: userType
  }

  static defaultProps = {
    id: null,
    user: null
  }

  componentDidMount() {
    this.fetch();
    this._isMounted = true;
  }
  
  componentDidUpdate(prevProps, /* prevState */) {
    if (this._isMounted) {
      if (this.props.id !== prevProps.id) {
        this.fetch();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetch = () => {
    if (typeof this.props.id === 'string') {
      if (this._isMounted) this.setState({ loading: true });

      collectionRef(this.props.id).get().then(snap => {
        if (!snap.empty) {
          if (this._isMounted) {
            this.setState({ 
              data: snap.data(),
              loading: false
            });
          }
        }
      }).catch(err => console.warn(err));
    }
  }

  onToggle = () => this.props.onToggle(this.state.selectedId);

	onChange = e => {
    e.persist();

    if (this._isMounted) {
      this.setState(prevState => ({ 
        changes: true,
        data: { ...prevState.data, [e.target.name]: e.target.value }, 
        errors: { ...prevState.errors, [e.target.name]: null }
      }));
    }
  };
  
  onChangeMaxChars = e => {
    e.persist();
    const leftChars = `${e.target.name}_leftChars`;
    const maxChars = `${e.target.name}_maxChars`;

    if (this._isMounted) {
      this.setState(prevState => ({
        data: { ...prevState.data, [e.target.name]: e.target.value }, 
        [leftChars]: prevState[maxChars] - e.target.value.length, 
        changes: true
      }));
    }
  };

  onChangeSelect = key => e => {
    e.persist();

    if (this._isMounted) {
      this.setState(prevState => ({ 
        changes: true,
        data: { ...prevState.data, [key]: e.target.value }, 
        errors: { ...prevState.errors, [key]: null } 
      }));
    }
  };

  checkTitle = async title => {
    const { openSnackbar } = this.props;
    const result = await collectionsRef.where('title', '==', title).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }

	validate = async data => {
    const errors = {};
    const isDuplicate = typeof this.props.id === 'string' ? false : await this.checkTitle(data.title);

    if (!data.title) { 
      errors.title = "Inserisci il titolo"; 
    } else if (isDuplicate) {
      errors.title = "Collezione già presente";
    }
    if (!data.description) { 
      errors.description = "Inserisci una descrizione"; 
    } else if (data.description && data.description.length > this.state.desc_maxChars) {
      errors.description = `Lunghezza massima ${this.state.desc_maxChars} caratteri`;
    } else if (data.description && data.description.length < this.state.desc_minChars) {
      errors.description = `Lunghezza minima ${this.state.desc_minChars} caratteri`;
    }
    if (data.genres && (data.genres.length > 3)) {
      errors.genres = "Massimo 3 generi";
    }
		return errors;
  };
  
	onSubmit = async e => {
    e.preventDefault();
    const { changes, data } = this.state;
    const { openSnackbar, user } = this.props;
    const prevState = this.state;

    if (changes) {
      const errors = await this.validate(prevState.data);
      
      if (this._isMounted) this.setState({ authError: '', errors });
      
      if (Object.keys(errors).length === 0) {
        if (this._isMounted) this.setState({ loading: true });
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
          this.onToggle();
          if (this._isMounted) {
            this.setState({ loading: false });
          }
          openSnackbar(data.title ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(err => console.warn(err));
      }
    } else this.onToggle();
  };

	render() {
    const { authError, data, errors, loading, desc_leftChars, desc_maxChars } = this.state;
    
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
        <Overlay onClick={this.onToggle} />
        <div role="dialog" aria-describedby="new collection" className="dialog light">
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
                    onChange={this.onChange}
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
                    onChange={this.onChange}
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
                    onChange={this.onChangeMaxChars}
                    rowsMax={20}
                    multiline
                    error={Boolean(errors.description)}
                  />
                  {errors.description && <FormHelperText className="message error">{errors.description}</FormHelperText>}
                  {(desc_leftChars !== undefined) && 
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
                    onChange={this.onChangeSelect("genres")}
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
                    onChange={this.onChange}
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
                    onChange={this.onChange}
                    error={Boolean(errors.photoURL)}
                  />
                  {errors.photoURL && <FormHelperText className="message error">{errors.photoURL}</FormHelperText>}
                </FormControl>
              </div>
            </div> */}

					  {authError && <div className="row"><div className="col message error">{authError}</div></div>}
          </div>
          <div className="footer no-gutter">
            <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Salva le modifiche</button>
          </div>
        </div>
      </>
		);
	}
}