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
    nid: stringType,
    uid: stringType.isRequired
  }

  componentDidMount() {
    const { nid, uid } = this.props;
    if (nid && uid) {
      this.fetch();
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { nid, uid } = this.props;
    if (nid !== prevProps.nid || uid !== prevProps.uid) {
      this.fetch();
    }
  }

  fetch = () => {
    const { nid, uid } = this.props;
    this.setState({ loading: true });
    if (nid && uid) {
      // console.log({ nid, uid });
      noteRef(uid, nid).get().then(snap => {
        if (!snap.empty) {
          // console.log(snap.data());
          this.setState({ 
            data: snap.data(),
            loading: false
          });
        }
      }).catch(error => console.warn(error));
    }
  }

  onToggle = () => this.props.onToggle(this.state.selectedId);

	onChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }, errors: { ...this.state.errors, [e.target.name]: null }
		});
  };
  
  onChangeMaxChars = e => {
    const leftChars = `${e.target.name}_leftChars`;
    const maxChars = `${e.target.name}_maxChars`;
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
    const { nid, openSnackbar, uid, user } = this.props;
		const errors = this.validate(data);
		this.setState({ authError: '', errors });
		if(Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      // console.log(`Sending notification to ${uid}`);
      const newNoteRef = notesRef(uid).doc();
      const ref = nid ? noteRef(uid, nid) : newNoteRef;
      if (!nid) {
        notesRef(uid).set({ count: 0 })
      }
      ref.set({
        nid: nid || newNoteRef.id,
        text: data.text,
        created_num: Number((new Date()).getTime()),
        createdBy: user.displayName,
        createdByUid: user.uid,
        read: false
      }).then(() => {
        this.onToggle();
        this.setState({ loading: false, data: { text: '' } });
        openSnackbar(nid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
      }).catch(error => console.warn(error));
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

		return (
			<React.Fragment>
        <div className="overlay" onClick={this.onToggle} />
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