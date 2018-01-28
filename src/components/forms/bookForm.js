import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';
import Cover from '../cover';
import { languages } from '../../config/shared';
import { bookRef } from '../../config/firebase';

export default class BookForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      data: {
        bid: this.props.book.bid,
        ISBN_num: this.props.book.ISBN_num,
        title: this.props.book.title,
        title_sort: this.props.book.title_sort,
        subtitle: this.props.book.subtitle,
        authors: this.props.book.authors,
        format: this.props.book.format,
        covers: this.props.book.covers,
        pages_num: this.props.book.pages_num,
        publisher: this.props.book.publisher,
        publication: this.props.book.publication,
        edition: this.props.book.edition,
        genres: this.props.book.genres,
        languages: this.props.book.languages,
        description: this.props.book.description,
        incipit: this.props.book.incipit
      },
      description_maxChars: 2000,
      incipit_maxChars: 5000,
      loading: false,
      errors: {},
      authError: '',
      changes: false
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
  
  onChange = e => {
    this.setState({
      ...this.state, data: { ...this.state.data, [e.target.name]: e.target.value }, changes: true
    });
  };

  onChangeNumber = e => {
    this.setState({
      ...this.state, data: { ...this.state.data, [e.target.name]: parseInt(e.target.value, 10) }, changes: true
    });
  };

  onChangeSelect = type => (e, i, val) => {
		this.setState({ 
      ...this.state, data: { ...this.state.data, [type]: val }, changes: true
    });
  };
  
  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    console.log(leftChars, this.state[maxChars]);
    this.setState({
      ...this.state, data: { ...this.state.data, [e.target.name]: e.target.value }, [leftChars]: this.state[maxChars] - e.target.value.length, changes: true
    });
  };

  onSubmit = e => {
    e.preventDefault();
    if (this.state.changes) {
      const errors = this.validate(this.state.data);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        bookRef(this.state.data.bid).set({
          ...this.state.data,
          bid: this.state.data.bid
        }).then(() => {
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

  validate = data => {
    const errors = {};
    if (!data.title) errors.title = "Inserisci il titolo";
    else if (data.title.length > 255) errors.title = "Lunghezza massima 255 caratteri";
    if (data.subtitle && data.subtitle.length > 255) errors.subtitle = "Lunghezza massima 255 caratteri";
    if (!data.authors) errors.authors = "Inserisci l'autore";
    else if (data.authors.length > 255) errors.authors = "Lunghezza massima 255 caratteri";
    if (!data.publisher) errors.publisher = "Inserisci l'editore";
    else if (data.publisher.length > 150) errors.publisher = "Lunghezza massima 150 caratteri";
    if (!data.pages_num) errors.pages_num = "Inserisci il numero di pagine";
    else if (data.pages_num.toString().length > 5) errors.pages_num = "Lunghezza massima 5 cifre";
    if (!data.ISBN_num) errors.ISBN_num = "Inserisci il codice ISBN";
    else if (data.ISBN_num.toString().length !== 13) errors.ISBN_num = "L'ISBN deve essere composto da 13 cifre";
    else if (data.ISBN_num.toString().substring(0,3) !== "978") errors.ISBN_num = "l'ISBN deve iniziare per 978";
    if (new Date(data.publication) > new Date()) errors.birth_date = "Data di pubblicazione non valida";
    else if (data.edition.toString().length > 2) errors.pages_num = "Max 2 cifre";
    if (data.description && data.description.length > this.state.description_maxChars) errors.description = `Lunghezza massima ${this.state.description_maxChars} caratteri`;
    if (data.incipit && data.incipit.length > this.state.incipit_maxChars) errors.incipit = `Lunghezza massima ${this.state.incipit_maxChars} caratteri`;
    return errors;
  }

  exitEditing = () => this.props.isEditing();
	
	render() {
    const { data, description_leftChars, description_maxChars, incipit_leftChars, incipit_maxChars, errors } = this.state;
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
                  value={data.title}
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
                  value={data.subtitle}
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
                  value={data.authors}
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
                    value={data.ISBN_num}
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
                    value={data.pages_num}
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
                  value={data.publisher}
                  onChange={this.onChange}
                  fullWidth={true}
                />
              </div>
              <div className="row">
                <div className="col-8 form-group">
									<DatePicker 
										name="publication"
										hintText="2013-05-01" 
										openToYearSelection={true} 
										errorText={errors.publication}
										floatingLabelText="Data di pubblicazione"
										value={data.publication ? new Date(data.publication) : null}
										onChange={this.onChangeDate}
										fullWidth={true}
									/>
								</div>
                <div className="col-4 form-group">
                  <TextField
                    name="edition"
                    type="number"
                    hintText="es: 1"
                    errorText={errors.edition}
                    floatingLabelText="Edizione"
                    value={data.edition || null}
                    onChange={this.onChangeNumber}
                    fullWidth={true}
                  />
                </div>
              </div>
              <div className="form-group">
                <SelectField
                  errorText={errors.languages}
                  floatingLabelText="Lingua"
                  value={data.languages || null}
                  onChange={this.onChangeSelect("languages")}
                  fullWidth={true}
                  multiple={true}
                >
                  {menuItemsMap(languages, data.languages)}
                </SelectField>
              </div>
              <div className="form-group">
                <TextField
                  name="description"
                  type="text"
                  hintText={`Inserisci una descrizione del libro (max ${description_maxChars} caratteri)...`}
                  errorText={errors.description}
                  floatingLabelText="Descrizione"
                  value={data.description}
                  onChange={this.onChangeMaxChars}
                  fullWidth={true}
                  multiLine={true}
                  rows={4}
                />
                {(description_leftChars !== undefined) && 
                  <p className={`message ${(description_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {description_leftChars}</p>
                }
              </div>
              <div className="form-group">
                <TextField
                  name="incipit"
                  type="text"
                  hintText={`Inserisci alcuni paragrafi del libro (max ${incipit_maxChars} caratteri)...`}
                  errorText={errors.incipit}
                  floatingLabelText="Incipit"
                  value={data.incipit}
                  onChange={this.onChangeMaxChars}
                  fullWidth={true}
                  multiLine={true}
                  rows={4}
                />
                {(incipit_leftChars !== undefined) && 
                  <p className={`message ${(incipit_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {incipit_leftChars}</p>
                }
              </div>

            </div>
            <div className="col-md-6">
              <Cover book={data} />
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
  isEditing: PropTypes.func.isRequired,
  book: PropTypes.shape({
    bid: PropTypes.string.isRequired,
    ISBN_num: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    title_sort: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    authors: PropTypes.string.isRequired, //PropTypes.arrayOf(PropTypes.string).isRequired,
    format: PropTypes.string,
    covers: PropTypes.arrayOf(PropTypes.string),
    pages_num: PropTypes.number.isRequired,
    publisher: PropTypes.string.isRequired,
    publication: PropTypes.string,
    edition: PropTypes.number,
    genres: PropTypes.arrayOf(PropTypes.string),
    languages: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    incipit: PropTypes.string
  }).isRequired
}