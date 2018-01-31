import React from 'react';
import { bookType, funcType } from '../../config/types';
import { CircularProgress } from 'material-ui';
import { bookRef } from '../../config/firebase';
import Cover from '../cover';
import Rating from '../rating';

export default class BookForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: null,
      ratings: null,
      loading: false,
      errors: {}
    }
  }

  componentWillReceiveProps(nextProps, props) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book
      });
    }
  }

  componentDidMount(nextProps, props) {
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
    const { book } = this.props;

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
              <p className="info-row">
                <Rating ratings={book.ratings}/>
              </p>
              {book.description && <p className="description">{book.description || ''}</p>}
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
  addBookToShelf: funcType.isRequired,
  addBookToWishlist: funcType.isRequired,
  isEditing: funcType.isRequired,
  book: bookType.isRequired
}