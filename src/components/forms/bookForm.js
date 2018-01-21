import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, FlatButton, MenuItem, SelectField, TextField } from 'material-ui';
import { languages } from '../../config/shared';

export default class BookForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      data: {
        ISBN_num: this.props.book.ISBN_num,
        title: this.props.book.title,
        subtitle: this.props.book.subtitle,
        authors: this.props.book.authors,
        format: this.props.book.format,
        cover: this.props.book.covers[0],
        pages_num: this.props.book.pages_num,
        publisher: this.props.book.publisher,
        publication: this.props.book.publication,
        genres: this.props.book.genres,
        language: this.props.book.language
      },
      covers: this.props.book.covers,
      index: 0,
      loading: false,
      errors: {}
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      data: {
        ISBN_num: props.book.ISBN_num,
        title: props.book.title,
        subtitle: props.book.subtitle,
        authors: props.book.authors,
        format: props.book.format,
        cover: props.book.covers[0],
        pages_num: props.book.pages_num,
        publisher: props.book.publisher,
        publication: props.book.publication,
        genres: props.book.genres,
        language: props.book.language
      },
      covers: props.book.covers
    })
  }
  
  onChange = e => {
    this.setState({
      ...this.state,
      data: { ...this.state.data, [e.target.name]: e.target.value }
    });
  };

  onChangeNumber = e => {
    this.setState({
      ...this.state,
      data: { ...this.state.data, [e.target.name]: parseInt(e.target.value, 10) }
    });
  };

  onChangeSelect = type => (e, i, val) => {
		this.setState({ 
      ...this.state,
      data: { ...this.state.data, [type]: val } 
    });
	};

  onSubmit = e => {
    e.preventDefault();
    const errors = this.validate(this.state.data);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });

      /* booksRef(this.props.uid).set({
				...this.state.data
			}).then(() => {
				this.setState({ 
					loading: false
				});
				//this.setState({ redirectToReferrer: true });
			}).catch(error => {
				this.setState({
					authError: error.message,
					loading: false
				});
			}); */

      this.props.submit(this.state.data).catch(err => {
        this.setState({ 
          errors: err.response.data.errors, 
          loading: false 
        }) 
      });
    }
  };

  changeCover = () => {
    const { index, covers } = this.state;
    const newIndex = index + 1 >= covers.length ? 0 : index + 1;
    this.setState({
      index: newIndex,
      data: { ...this.state.data, cover: covers[newIndex] }
    });
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
    if (!data.language) errors.language = "Seleziona la lingua";
    return errors;
  }
	
	render() {
    const { data, errors } = this.state;
    const menuItemsMap = arr => arr.map(item => <MenuItem value={`${item.id}`} key={`${item.id}`} primaryText={`${item.name}`} />);
		const languagesMenuItems = menuItemsMap(languages);

		return (
			<form onSubmit={this.onSubmit} id="BookFormComponent">
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
            <div className="form-group">
              <SelectField
                errorText={errors.language}
                floatingLabelText="Lingua"
                value={data.language || null}
                onChange={this.onChangeSelect("language")}
                fullWidth={true}
              >
                {languagesMenuItems}
              </SelectField>
            </div>
          </div>
          <div className="col-md-6">
            {data.cover ? 
              <div className="book">
                <div className="cover" style={{backgroundImage: `url(${data.cover})`}}></div>
                {this.state.covers.length > 1 && <FlatButton onClick={this.changeCover} label="Cambia copertina"/>}
              </div>
            :
              <div className="book">
                <div className="cover">
                  <h2 className="title">{data.title}</h2>
                  {data.subtitle.length > 0 && <h3 className="subtitle">{data.subtitle}</h3>}
                  <span className="author">{data.authors}</span>
                  <span className="publisher">{data.publisher}</span>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="footer no-gutter">
          <button className="btn btn-footer primary">Salva</button>
        </div>
			</form>
		);
	}
}

BookForm.propTypes = {
  submit: PropTypes.func.isRequired,
  book: PropTypes.shape({
    ISBN_num: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    title_sort: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    authors: PropTypes.string.isRequired, //PropTypes.arrayOf(PropTypes.string).isRequired,
    format: PropTypes.string,
    covers: PropTypes.arrayOf(PropTypes.string.isRequired),
    pages_num: PropTypes.number.isRequired,
    publisher: PropTypes.string.isRequired,
    publication: PropTypes.string,
    genres: PropTypes.string, //PropTypes.arrayOf(PropTypes.string),
    language: PropTypes.string
  }).isRequired
}