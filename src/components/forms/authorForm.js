import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React from 'react';
import { authorRef, authorsRef } from '../../config/firebase';
import { getInitials, handleFirestoreError, normalizeString } from '../../config/shared';
import { funcType, stringType, userType } from '../../config/types';
import Overlay from '../overlay';

export default class AuthorForm extends React.Component {
	state = {
    data: {
      displayName: '',
      source: '',
      sex: '',
      photoURL: '',
      bio: ''
    },
    bio_maxChars: 1000,
    bio_minChars: 50,
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
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      authorRef(this.props.id).get().then(snap => {
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

  checkDisplayName = async displayName => {
    const { openSnackbar } = this.props;
    const result = await authorsRef.where('displayName', '==', displayName).limit(1).get().then(snap => {
      if (!snap.empty) return true;
      return false;
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    return result;
  }

	validate = async data => {
    const errors = {};
    const isDuplicate = await this.checkDisplayName(data.displayName);

    if (!data.displayName) { 
      errors.displayName = "Inserisci il nominativo"; 
    } else if (isDuplicate) {
      errors.displayName = "Autore già presente";
    }
    if (!data.sex) {
      errors.sex = "Sesso mancante";
    }
    if (!data.bio) { 
      errors.bio = "Inserisci una biografia"; 
    } else if (data.bio && data.bio.length > this.state.bio_maxChars) {
      errors.bio = `Lunghezza massima ${this.state.bio_maxChars} caratteri`;
    } else if (data.bio && data.bio.length < this.state.bio_minChars) {
      errors.bio = `Lunghezza minima ${this.state.bio_minChars} caratteri`;
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
        const ref = data.displayName ? authorRef(normalizeString(data.displayName)) : authorsRef.doc();
        ref.set({
          bio: data.bio || '',
          displayName: data.displayName || '',
          edit: data.edit || true,
          // followers: data.followers || {},
          lastEdit_num: Number((new Date()).getTime()),
          lastEditBy: user.displayName,
          lastEditByUid: user.uid,
          photoURL: data.photoURL || '',
          sex: data.sex || '',
          source: data.source || ''
        }).then(() => {
          this.onToggle();
          if (this._isMounted) this.setState({ loading: false });
          openSnackbar(data.displayName ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch(err => console.warn(err));
      }
    } else this.onToggle();
	};

	render() {
		const { authError, data, errors, loading, bio_leftChars, bio_maxChars } = this.state;

		return (
			<>
        <Overlay onClick={this.onToggle} />
        <div role="dialog" aria-describedby="new author" className="dialog light">
          {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.displayName)} htmlFor="displayName">Nominativo</InputLabel>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoFocus
                    placeholder="Es: George Orwell"
                    value={data.displayName}
                    onChange={this.onChange}
                    error={Boolean(errors.displayName)}
                  />
                  {errors.displayName && <FormHelperText className="message error">{errors.displayName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="form-group col col-sm-3">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.sex)} htmlFor="sex">Sesso</InputLabel>
                  <Select
                    id="sex"
                    value={data.sex}
                    onChange={this.onChangeSelect("sex")}
                    error={Boolean(errors.sex)}>
                    <MenuItem key="m" value="m">Uomo</MenuItem>
                    <MenuItem key="f" value="f">Donna</MenuItem>
                    <MenuItem key="x" value="x">Altro</MenuItem>
                  </Select>
                  {errors.sex && <FormHelperText className="message error">{errors.sex}</FormHelperText>}
                </FormControl>
              </div>
            </div>

            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.bio)} htmlFor="bio">Biografia</InputLabel>
                  <Input
                    id="bio"
                    name="bio"
                    type="text"
                    placeholder={`Inserisci la biografia (max ${bio_maxChars} caratteri)...`}
                    value={data.bio}
                    onChange={this.onChangeMaxChars}
                    rowsMax={20}
                    multiline
                    error={Boolean(errors.bio)}
                  />
                  {errors.bio && <FormHelperText className="message error">{errors.bio}</FormHelperText>}
                  {(bio_leftChars !== undefined) && 
                    <FormHelperText className={`message ${(bio_leftChars < 0) ? 'alert' : 'neutral'}`}>
                      Caratteri rimanenti: {bio_leftChars}
                    </FormHelperText>
                  }
                </FormControl>
              </div>
            </div>
            
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.source)} htmlFor="source">URL fonte</InputLabel>
                  <Input
                    id="source"
                    name="source"
                    type="text"
                    placeholder="Es: //it.wikipedia.org/wiki/George_Orwell"
                    value={data.source}
                    onChange={this.onChange}
                    error={Boolean(errors.source)}
                  />
                  {errors.source && <FormHelperText className="message error">{errors.source}</FormHelperText>}
                </FormControl>
              </div>
            </div>

            <div className="row">
              <div className="col-auto">
                <Avatar className="image avatar prepend-input" alt="Avatar">
                  {data.photoURL ? <img src={data.photoURL} alt="" style={{ width: '100%', height: '100%', }} /> : getInitials(data.displayName)}
                </Avatar>
              </div>
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
            </div>

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