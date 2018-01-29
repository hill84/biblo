import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from 'material-ui';
import Cover from '../cover';
import { bookRef } from '../../config/firebase';

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
        covers: this.props.book.covers || '',
        pages_num: this.props.book.pages_num || 0,
        publisher: this.props.book.publisher || '',
        publication: this.props.book.publication || '',
        edition: this.props.book.edition || 0,
        genres: this.props.book.genres || '',
        languages: this.props.book.languages || '',
        description: this.props.book.description || '',
        incipit: this.props.book.incipit || ''
      },
      loading: false,
      errors: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book
      });
    }
  }

  componentDidMount(props){
    bookRef(this.props.book.bid).onSnapshot(snap => {
      this.setState({
        book: snap.data()
      });
    });
  }

  onAddBookToShelf = () => {
    this.props.addBookToShelf(this.state.book.bid);
  }

  onAddBookToWishlist = () => {
    this.props.addBookToWishlist(this.state.book.bid);
  }

  onEditing = () => this.props.isEditing();
	
	render() {
    const { book } = this.state;

		return (
      <div ref="BookProfileComponent">
        <div className="card book-profile">
          {this.state.loading && <div className="loader"><CircularProgress /></div>}
          <div className="row">
            <div className="col-md-auto col-sm-12">
              <Cover book={book} />
            </div>
            <div className="col">
              <h2 className="title">{book.title}</h2>
              {book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
              <p className="info-row">
                {book.authors && <span className="counter">di {book.authors}</span>}
                {book.publisher && <span className="counter">editore: {book.publisher}</span>}
                <button className="link counter" onClick={this.onEditing}>Modifica</button>
              </p>
              {book.description && <p className="description">{book.description}</p>}
            </div>
          </div>
        </div>
        <button className="btn primary" onClick={this.onAddBookToShelf}>Aggiungi a libreria</button>
        <button className="btn primary" onClick={this.onAddBookToWishlist}>Aggiungi a wishlist</button>
      </div>
		);
	}
}

BookForm.propTypes = {
  addBookToShelf: PropTypes.func.isRequired,
  addBookToWishlist: PropTypes.func.isRequired,
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