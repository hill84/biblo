import React from 'react';
import { bookType, funcType } from '../../config/types';
import { CircularProgress } from 'material-ui';
import { joinToLowerCase } from '../../config/shared';
import { bookRef } from '../../config/firebase';
import Rater from 'react-rater';
import Cover from '../cover';
import Rating from '../rating';

export default class BookForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      //bookTitle: this.props.match.params.bookTitle,
      book: null,
      bookInShelf: this.props.bookInShelf,
      bookInWishlist: this.props.bookInWishlist,
      userBooks: this.props.userBooks,
      userBook: {
        bid: '123456',
        title: 'Sherlock Holmes',
        author: 'Arthur Conan Doyle',
        rating_num: 0
      },
      loading: false,
      errors: {}
    }
  }

  componentWillReceiveProps(nextProps, props) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book,
        bookInShelf: nextProps.bookInShelf,
        bookInWishlist: nextProps.bookInWishlist,
        userBooks: nextProps.userBooks
      });
    }
  }

  componentDidMount(props) {
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

  onRemoveBookFromShelf = () => {
    this.props.removeBookFromShelf(this.state.book.bid);
  }

  onRemoveBookFromWishlist = () => {
    this.props.removeBookFromWishlist(this.state.book.bid);
  }

  onRateBook = rate => {
    if(rate.type === 'click') {
      this.props.rateBook(this.state.book.bid, rate.rating);
      this.setState({
        userBook: {
          ...this.state.userBook,
          rating_num: rate.rating
        }
      })
    }
  }

  onEditing = () => this.props.isEditing();
	
	render() {
    const { book, bookInShelf, bookInWishlist, userBook } = this.state;

    if (!book) return null;

		return (
      <div ref="BookProfileComponent">
        <div className="card book-profile">
          {this.state.loading && <div className="loader"><CircularProgress /></div>}
          <div className="row">
            <div className="col-md-auto col-sm-12">
              <Cover book={book} />
            </div>
            <div className="col">
              <h2 className="title">{book.title || ''}</h2>
              {book.subtitle && <h3 className="subtitle">{book.subtitle || ''}</h3>}
              <div className="info-row">
                {book.authors && <span className="counter">di {book.authors}</span>}
                {book.publisher && <span className="counter">editore: {book.publisher}</span>}
                <button className="link counter" onClick={this.onEditing}>Modifica</button>
              </div>
              <div className="info-row">
                <Rating ratings={book.ratings || 0}/>
              </div>
              <div className="info-row">
                {bookInShelf ? 
                  <button className="btn success error-on-hover" onClick={this.onRemoveBookFromShelf}>
                    <span className="hide-on-hover">Aggiunto a libreria</span>
                    <span className="show-on-hover">Rimuovi da libreria</span>
                  </button>
                :
                  <button className="btn primary" onClick={this.onAddBookToShelf}>Aggiungi a libreria</button>
                }
                {bookInWishlist ? 
                  <button className="btn success error-on-hover" onClick={this.onRemoveBookFromWishlist}>
                    <span className="hide-on-hover">Aggiunto a lista desideri</span>
                    <span className="show-on-hover">Rimuovi da lista desideri</span>
                  </button>
                :
                  <button className="btn primary" onClick={this.onAddBookToWishlist}>Aggiungi a lista desideri</button>
                }
                {bookInShelf && userBook && 
                  <div className="user rating">
                    <Rater total={5} onRate={rate => this.onRateBook(rate)} rating={userBook.rating_num || 0} />
                    &nbsp;<span>{userBook.rating_num || 0}</span>
                    &nbsp;&nbsp;&nbsp;<span>Il tuo voto</span>
                  </div>
                }
              </div>
              {book.description && <p className="description">{book.description || ''}</p>}
              <div className="info-row">
                <span className="counter">ISBN: {book.ISBN_num}</span>
                {book.publication && <span className="counter">Pubblicazione: {new Date(book.publication).toLocaleDateString()}</span>}
                {book.edition && <span className="counter">Edizione: {book.edition}</span>}
                {book.pages_num && <span className="counter">Pagine: {book.pages_num}</span>}
                {book.format && <span className="counter">Formato: {book.format}</span>}
                {book.genres && <span className="counter">Genere: {joinToLowerCase(book.genres)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
		);
	}
}

BookForm.propTypes = {
  addBookToShelf: funcType.isRequired,
  addBookToWishlist: funcType.isRequired,
  removeBookFromShelf: funcType.isRequired,
  removeBookFromWishlist: funcType.isRequired,
  rateBook: funcType.isRequired,
  isEditing: funcType.isRequired,
  book: bookType.isRequired,
  //userBook: userBookType.isRequired
}