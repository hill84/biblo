import React from 'react';
import { bookType, funcType } from '../../config/types';
import { CircularProgress, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';
import { languages } from '../../config/shared';
import { bookRef } from '../../config/firebase';
import Cover from '../cover';

export default class BookForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: {
        bid: this.props.book.bid || '', 
        ISBN_num: this.props.book.ISBN_num || 0, 
        title: this.props.book.title || '', 
        title_sort: this.props.book.title_sort || '', 
        subtitle: this.props.book.subtitle || '', 
        authors: this.props.book.authors || '', 
        format: this.props.book.format || '', 
        covers: this.props.book.covers || [], 
        pages_num: this.props.book.pages_num || 0, 
        publisher: this.props.book.publisher || '', 
        publication: this.props.book.publication || '', 
        edition_num: this.props.book.edition_num || 0, 
        genres: this.props.book.genres || [], 
        languages: this.props.book.languages, 
        description: this.props.book.description || '', 
        incipit: this.props.book.incipit || '',
        readers_num: this.props.book.readers_num || 0,
        ratings_num: this.props.book.ratings_num || 0,
        rating_num: this.props.book.totalRating_num || 0,
        reviews_num: this.props.book.reviews_num || 0
      },
      isEditingDescription: false,
      isEditingIncipit: false,
      description_maxChars: 1000,
      incipit_maxChars: 2500,
      loading: false,
      errors: {},
      authError: '',
      changes: false
    }
  }

  componentWillReceiveProps(nextProps, props) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book
      });
    }
  }

  componentDidMount(props) {
    bookRef(this.props.book.bid).onSnapshot(snap => {
      this.setState({
        ...this.state,
        data: snap.data()
      });
    });
  }

  onEditDescription = e => {
    e.preventDefault();
    this.setState({
      isEditingDescription: !this.state.isEditingDescription
    });
  }

  onEditIncipit = e => {
    e.preventDefault();
    this.setState({
      isEditingIncipit: !this.state.isEditingIncipit
    });
  }
  
  onChange = e => {
    this.setState({
      ...this.state, book: { ...this.state.book, [e.target.name]: e.target.value }, changes: true
    });
  };

  onChangeNumber = e => {
    this.setState({
      ...this.state, book: { ...this.state.book, [e.target.name]: parseInt(e.target.value, 10) }, changes: true
    });
  };

  onChangeSelect = key => (e, i, val) => {
		this.setState({ 
      ...this.state, book: { ...this.state.book, [key]: val }, changes: true
    });
  };

  onChangeDate = key => (e, date) => {
		this.setState({ 
      ...this.state, book: { ...this.state.book, [key]: String(date) }, changes: true
    });
	};
  
  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, book: { ...this.state.book, [e.target.name]: e.target.value }, [leftChars]: this.state[maxChars] - e.target.value.length, changes: true
    });
  };

  onSubmit = e => {
    e.preventDefault();
    if (this.state.changes) {
      const errors = this.validate(this.state.book);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        bookRef(this.props.book.bid).set(this.state.book).then(() => {
          this.setState({ 
            //redirectToReferrer: true,
            loading: false,
            changes: false
          });
          this.props.isEditing();
        }).catch(error => {
          this.setState({
            authError: error.message,
            loading: false
          });
        });
      }
    } else {
      this.props.isEditing();
    }
  };

  validate = book => {
    const errors = {};
    if (!book.title) {
      errors.title = "Inserisci il titolo";
    } else if (book.title.length > 255) {
      errors.title = "Lunghezza massima 255 caratteri";
    }
    if (book.subtitle && book.subtitle.length > 255) {
      errors.subtitle = "Lunghezza massima 255 caratteri";
    }
    if (!book.authors) {
      errors.authors = "Inserisci l'autore";
    } else if (book.authors.length > 255) {
      errors.authors = "Lunghezza massima 255 caratteri";
    }
    if (!book.publisher) {
      errors.publisher = "Inserisci l'editore";
    } else if (book.publisher.length > 150) {
      errors.publisher = "Lunghezza massima 150 caratteri";
    }
    if (!book.pages_num) {
      errors.pages_num = "Inserisci il numero di pagine";
    } else if (book.pages_num.toString().length > 5) {
      errors.pages_num = "Lunghezza massima 5 cifre";
    }
    if (!book.ISBN_num) {
      errors.ISBN_num = "Inserisci il codice ISBN";
    } else if (book.ISBN_num.toString().length !== 13) {
      errors.ISBN_num = "L'ISBN deve essere composto da 13 cifre";
    } else if (book.ISBN_num.toString().substring(0,3) !== "978") {
      errors.ISBN_num = "l'ISBN deve iniziare per 978";
    }
    if (Date(book.publication) > new Date()) {
      errors.publication = "Data di pubblicazione non valida";
    }
    if (book.edition_num < 1) {
      errors.edition_num = "Numero di edizione non valido";
    } else if (book.edition_num.toString().length > 2) {
      errors.edition_num = "Max 2 cifre";
    }
    if (book.description && book.description.length > this.state.description_maxChars) {
      errors.description = `Lunghezza massima ${this.state.description_maxChars} caratteri`;
    }
    if (book.incipit && book.incipit.length > this.state.incipit_maxChars) {
      errors.incipit = `Lunghezza massima ${this.state.incipit_maxChars} caratteri`;
    }
    return errors;
  }

  exitEditing = () => this.props.isEditing();
	
	render() {
    const { book, description_leftChars, description_maxChars, incipit_leftChars, incipit_maxChars, isEditingDescription, isEditingIncipit, errors } = this.state;
		const menuItemsMap = (arr, values) => arr.map(item => 
			<MenuItem 
				value={item.name} 
				key={item.id} 
				insetChildren={values ? true : false} 
				checked={values ? values.includes(item.name) : false} 
				primaryText={item.name} 
			/>
		);

		return (
      <div ref="BookFormComponent">
        <form onSubmit={this.onSubmit} className="card">
          {this.state.loading && <div className="loader"><CircularProgress /></div>}
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <TextField
                  name="title"
                  type="text"
                  hintText="es: Sherlock Holmes"
                  errorText={errors.title}
                  floatingLabelText="Titolo"
                  value={book.title || ''}
                  onChange={this.onChange}
                  fullWidth={true}
                />
              </div>
              <div className="form-group">
                <TextField
                  name="subtitle"
                  type="text"
                  hintText="es: Uno studio in rosso"
                  errorText={errors.subtitle}
                  floatingLabelText="Sottotitolo"
                  value={book.subtitle || ''}
                  onChange={this.onChange}
                  fullWidth={true}
                />
              </div>
              <div className="form-group">
                <TextField
                  name="authors"
                  type="text"
                  hintText="es: Arthur Conan Doyle"
                  errorText={errors.authors}
                  floatingLabelText="Autore (nome e cognome)"
                  value={book.authors}
                  onChange={this.onChange}
                  fullWidth={true}
                />
              </div>
              <div className="row">
                <div className="form-group col-8">
                  <TextField
                    name="ISBN_num"
                    type="number"
                    hintText="es: 9788854152601"
                    errorText={errors.ISBN_num}
                    floatingLabelText="ISBN"
                    value={book.ISBN_num}
                    onChange={this.onChangeNumber}
                    fullWidth={true}
                  />
                </div>
                <div className="form-group col-4">
                  <TextField
                    name="pages_num"
                    type="number"
                    hintText="es: 128"
                    errorText={errors.pages_num}
                    floatingLabelText="Pagine"
                    value={book.pages_num}
                    onChange={this.onChangeNumber}
                    fullWidth={true}
                  />
                </div>
              </div>
              <div className="form-group">
                <TextField
                  name="publisher"
                  type="text"
                  hintText="es: Newton Compton (Live)"
                  errorText={errors.publisher}
                  floatingLabelText="Editore"
                  value={book.publisher}
                  onChange={this.onChange}
                  fullWidth={true}
                />
              </div>
              <div className="row">
                <div className="col-8 form-group">
									<DatePicker 
                    name="publication"
                    hintText="2013-05-01" 
                    cancelLabel="Annulla"
										openToYearSelection={true} 
										errorText={errors.publication}
										floatingLabelText="Data di pubblicazione"
										value={book.publication ? new Date(book.publication) : ''}
										onChange={this.onChangeDate("publication")}
										fullWidth={true}
									/>
								</div>
                <div className="col-4 form-group">
                  <TextField
                    name="edition"
                    type="number"
                    hintText="es: 1"
                    errorText={errors.edition_num}
                    floatingLabelText="Edizione"
                    value={book.edition_num}
                    onChange={this.onChangeNumber}
                    fullWidth={true}
                  />
                </div>
              </div>
              <div className="form-group">
                <SelectField
                  errorText={errors.languages}
                  floatingLabelText="Lingua"
                  value={book.languages}
                  onChange={this.onChangeSelect("languages")}
                  fullWidth={true}
                  multiple={true}
                >
                  {menuItemsMap(languages, book.languages)}
                </SelectField>
              </div>
              {isEditingDescription /* || book.description */ ?
                <div className="form-group">
                  <TextField
                    name="description"
                    type="text"
                    hintText={`Inserisci una descrizione del libro (max ${description_maxChars} caratteri)...`}
                    errorText={errors.description}
                    floatingLabelText="Descrizione"
                    value={book.description}
                    onChange={this.onChangeMaxChars}
                    fullWidth={true}
                    multiLine={true}
                    rows={4}
                  />
                  {(description_leftChars !== undefined) && 
                    <p className={`message ${(description_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {description_leftChars}</p>
                  }
                </div>
              :
                <div className="info-row">
                  <button className="btn flat centered" onClick={this.onEditDescription}>
                    {book.description ? 'Modifica la descrizione' : 'Aggiungi una descrizione'}
                  </button>
                </div>
              }
              {isEditingIncipit /* || book.incipit */ ? 
                <div className="form-group">
                  <TextField
                    name="incipit"
                    type="text"
                    hintText={`Inserisci alcuni paragrafi del libro (max ${incipit_maxChars} caratteri)...`}
                    errorText={errors.incipit}
                    floatingLabelText="Incipit"
                    value={book.incipit || ''}
                    onChange={this.onChangeMaxChars}
                    fullWidth={true}
                    multiLine={true}
                    rows={4}
                  />
                  {(incipit_leftChars !== undefined) && 
                    <p className={`message ${(incipit_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {incipit_leftChars}</p>
                  }
                </div>
              :
                <div className="info-row">
                  <button className="btn flat centered" onClick={this.onEditIncipit}>
                    {book.incipit ? "Modifica l'incipit" : "Aggiungi un incipit"}
                  </button>
                </div>
              }

            </div>
            <div className="col-md-6">
              <Cover book={book} />
            </div>
          </div>
          <div className="footer no-gutter">
            <button className="btn btn-footer primary">Salva</button>
          </div>
        </form>
        <div className="form-group">
          <button onClick={this.exitEditing} className="btn flat centered">Annulla</button>
        </div>
      </div>
		);
	}
}

BookForm.propTypes = {
  isEditing: funcType.isRequired,
  book: bookType.isRequired
}