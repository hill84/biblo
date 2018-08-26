import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';
import { noteRef, notesRef } from '../../config/firebase';
import { funcType, stringType } from '../../config/types';

export default class noteForm extends React.Component {
	state = {
    data: {
      text: ''
    },
    text_maxChars: 100,
    text_minChars: 10,
    loading: false,
    changes: false,
    errors: {},
    authError: ''
  }

  static propTypes = {
    onToggle: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    id: stringType
  }

  componentDidMount() {
    this._isMounted = true; 
    if (this.props.id) {
      this.fetch();
    }
  }

  componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if (this.props.id !== prevProps.id) {
        this.fetch();
      }
    }
  }

  fetch = () => {
    this.setState({ loading: true });
    noteRef(this.props.id).get().then(snap => {
      if (!snap.empty) {
        this.setState({ 
          data: snap.data().notes[this.props.i],
          loading: false
        });
      }
    }).catch(error => console.warn(error));
  }

  onToggle = () => this.props.onToggle(this.state.selectedId);

	onChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }, errors: { ...this.state.errors, [e.target.name]: null }
		});
  };
  
  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, 
      data: { ...this.state.data, [e.target.name]: e.target.value }, 
      [leftChars]: this.state[maxChars] - e.target.value.length, 
      changes: true
    });
  };

	onSubmit = e => {
    e.preventDefault();
    const { data } = this.state;
    const { openSnackbar, user } = this.props;
		const errors = this.validate(this.state.data);
		this.setState({ authError: '', errors });
		if(Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      //TODO
      /* const ref = data.qid ? noteRef(data.qid) : notesRef.doc();
      ref.set({
        text: data.note || '',
        created_num: Number((new Date()).getTime()),
        createdByUid: user.uid,
        read: data.read || false
      }).then(() => {
        this.onToggle();
        this.setState({ loading: false });
        openSnackbar(data.qid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
      }).catch(error => console.warn(error)); */
		}
	};

	validate = data => {
		const errors = {};
    if (!data.text) { 
      errors.text = "Inserisci il testo"; 
    } else if (data.text && data.text.length > this.state.text_maxChars) {
      errors.text = `Lunghezza massima ${this.state.text_maxChars} caratteri`;
    } else if (data.text && data.text.length < this.state.text_minChars) {
      errors.text = `Lunghezza minima ${this.state.text_minChars} caratteri`;
    }
		return errors;
	};

	render() {
    const { authError, data, errors, loading, text_leftChars, text_maxChars } = this.state;
    
    if (!data) return null;

		return (
			<React.Fragment>
        <div className="overlay" onClick={this.onToggle}></div>
        <div role="dialog" aria-describedby="new note" className="dialog light">
          {loading && <div className="loader"><CircularProgress /></div>}
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.text)} htmlFor="text">Testo della notifica</InputLabel>
                  <Input
                    id="text"
                    name="text"
                    type="text"
                    autoFocus
                    placeholder={`Inserisci il testo (max ${text_maxChars} caratteri)...`}
                    value={data.text}
                    onChange={this.onChangeMaxChars}
                    rowsMax={3}
                    multiline
                    error={Boolean(errors.text)}
                  />
                  {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                  {(text_leftChars !== undefined) && 
                    <FormHelperText className={`message ${(text_leftChars < 0) ? 'alert' : 'neutral'}`}>
                      Caratteri rimanenti: {text_leftChars}
                    </FormHelperText>
                  }
                </FormControl>
              </div>
            </div>
					  {authError && <div className="row"><div className="col message error">{authError}</div></div>}
          </div>
          <div className="footer no-gutter">
            <button className="btn btn-footer primary" onClick={this.onSubmit}>Salva le modifiche</button>
          </div>
        </div>
      </React.Fragment>
		);
	}
}