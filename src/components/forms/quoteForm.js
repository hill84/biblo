import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import React from 'react';
import { quoteRef, quotesRef } from '../../config/firebase';
import { funcType, stringType } from '../../config/types';

export default class QuoteForm extends React.Component {
	state = {
    data: {
      author: '',
      bid: '',
      bookTitle: '',
      coverURL: '',
      quote: ''
    },
    quote_maxChars: 500,
    quote_minChars: 50,
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
    quoteRef(this.props.id).get().then(snap => {
      if (!snap.empty) {
        this.setState({ 
          data: snap.data(),
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
    const leftChars = `${e.target.name}_leftChars`;
    const maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, 
      data: { ...this.state.data, [e.target.name]: e.target.value }, [leftChars]: this.state[maxChars] - e.target.value.length, changes: true
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
      const ref = data.qid ? quoteRef(data.qid) : quotesRef.doc();
      ref.set({
        author: data.author || '',
        bid: data.bid || '',
        bookTitle: data.bookTitle || '',
        coverURL: data.coverURL || '',
        lastEdit_num: Number((new Date()).getTime()),
        lastEditBy: user.displayName,
        lastEditByUid: user.uid,
        edit: data.edit || true,
        qid: data.qid || ref.id,
        quote: data.quote || ''
      }).then(() => {
        this.onToggle();
        this.setState({ loading: false });
        openSnackbar(data.qid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
      }).catch(error => console.warn(error));
		}
	};

	validate = data => {
		const errors = {};
    if (!data.quote) { 
      errors.quote = "Inserisci una citazione"; 
    } else if (data.quote && data.quote.length > this.state.quote_maxChars) {
      errors.quote = `Lunghezza massima ${this.state.quote_maxChars} caratteri`;
    } else if (data.quote && data.quote.length < this.state.quote_minChars) {
      errors.quote = `Lunghezza minima ${this.state.quote_minChars} caratteri`;
    }
    if (!data.author) { 
      errors.quote = "Inserisci l'autore"; 
    }
		return errors;
	};

	render() {
		const { authError, data, errors, loading, quote_leftChars, quote_maxChars } = this.state;

		return (
			<React.Fragment>
        <div className="overlay" onClick={this.onToggle} />
        <div role="dialog" aria-describedby="new quote" className="dialog light">
          {loading && <div className="loader"><CircularProgress /></div>}
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.quote)} htmlFor="quote">Citazione</InputLabel>
                  <Input
                    id="quote"
                    name="quote"
                    type="text"
                    autoFocus
                    placeholder={`Inserisci la citazione (max ${quote_maxChars} caratteri)...`}
                    value={data.quote}
                    onChange={this.onChangeMaxChars}
                    rowsMax={20}
                    multiline
                    error={Boolean(errors.quote)}
                  />
                  {errors.quote && <FormHelperText className="message error">{errors.quote}</FormHelperText>}
                  {(quote_leftChars !== undefined) && 
                    <FormHelperText className={`message ${(quote_leftChars < 0) ? 'alert' : 'neutral'}`}>
                      Caratteri rimanenti: {quote_leftChars}
                    </FormHelperText>
                  }
                </FormControl>
              </div>
            </div>
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.author)} htmlFor="author">Autore</InputLabel>
                  <Input
                    id="author"
                    name="author"
                    type="text"
                    placeholder="Es: George Orwell"
                    value={data.author}
                    onChange={this.onChange}
                    error={Boolean(errors.author)}
                  />
                  {errors.author && <FormHelperText className="message error">{errors.author}</FormHelperText>}
                </FormControl>
              </div>
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.bid)} htmlFor="bid">Bid libro</InputLabel>
                  <Input
                    id="bid"
                    name="bid"
                    type="text"
                    placeholder="Es: JlGUWw6oeAj3maP5MQtn"
                    value={data.bid}
                    onChange={this.onChange}
                    error={Boolean(errors.bid)}
                  />
                  {errors.bid && <FormHelperText className="message error">{errors.bid}</FormHelperText>}
                </FormControl>
              </div>
            </div>
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.bookTitle)} htmlFor="bookTitle">Titolo libro</InputLabel>
                  <Input
                    id="bookTitle"
                    name="bookTitle"
                    type="text"
                    placeholder="Es: 1984"
                    value={data.bookTitle}
                    onChange={this.onChange}
                    error={Boolean(errors.bookTitle)}
                  />
                  {errors.bookTitle && <FormHelperText className="message error">{errors.bookTitle}</FormHelperText>}
                </FormControl>
              </div>
            </div>
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.coverURL)} htmlFor="coverURL">URL Copertina</InputLabel>
                  <Input
                    id="coverURL"
                    name="coverURL"
                    type="text"
                    placeholder="Es: //firebasestorage.googleapis.com/.../books%2Fcover.jpg"
                    value={data.coverURL}
                    onChange={this.onChange}
                    error={Boolean(errors.coverURL)}
                  />
                  {errors.coverURL && <FormHelperText className="message error">{errors.coverURL}</FormHelperText>}
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