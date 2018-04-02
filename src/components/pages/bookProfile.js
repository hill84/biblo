import React from 'react';
import { funcType, userBookType } from '../../config/types';
import { CircularProgress } from 'material-ui';
import { join, joinToLowerCase } from '../../config/shared';
import Rater from 'react-rater';
import Cover from '../cover';
import Rating from '../rating';

export default class BookProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: {
        ...this.props.book,
        bid: this.props.book.bid || ''
      },
      userBook: this.props.userBook,
      loading: false,
      errors: {},
      isIncipitOpen: false,
      isMinified: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book,
        userBook: nextProps.userBook
      });
    }
  }

  componentDidMount(props) {
    if (this.props.book.description.length > 570) {
      this.setState({
        isMinified: true
      });
    }
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
      });
    }
  }

  onMinify = () => {
    this.setState(prevState => ({
      isMinified: !prevState.isMinified
    })); 
  }

  onOpenIncipit = () => {
    this.setState(prevState => ({
      isIncipitOpen: !prevState.isIncipitOpen
    })); 
  }

  onEditing = () => this.props.isEditing();
	
	render() {
    const { book, isIncipitOpen, isMinified, userBook } = this.state;
    
    if (!book || !userBook) return null;

		return (
      <div ref="BookProfileComponent">
        <div className="content-background"><div className="bg" style={{backgroundImage: `url(${book.covers[0]})`}}></div></div>
        <div className="container top">
          <div className="card text-align-center-sm">
            {this.state.loading && <div className="loader"><CircularProgress /></div>}
            <div className="row">
              <div className="col-md-auto col-sm-12" style={{marginBottom: 15}}>
                {book.incipit ? 
                  <div role="button" className="hoverable-items" onClick={this.onOpenIncipit}>
                    <Cover book={book} rating={false} info={false} />
                    {isIncipitOpen && 
                      <div role="dialog" aria-describedby="incipit" className="dialog book-incipit">
                        <p id="incipit">{book.incipit}</p>
                      </div>
                    }
                  </div>
                :
                  <Cover book={book} rating={false} info={false} />
                }
              </div>
              <div className="col book-profile">
                <h2 className="title">{book.title || ''}</h2>
                {book.subtitle && <h3 className="subtitle">{book.subtitle || ''}</h3>}
                <div className="info-row">
                  {book.authors && <span className="counter">di {join(book.authors)}</span>}
                  {book.publisher && <span className="counter">editore: {book.publisher}</span>}
                  <button className="btn sm flat counter" onClick={this.onEditing}>Modifica</button>
                </div>
                <div className="info-row">
                  <span className="counter">ISBN-13: {book.ISBN_13}</span>
                  {(book.ISBN_10 !== 0) && <span className="counter">ISBN-10: {book.ISBN_10}</span>}
                  {book.publication && <span className="counter">Pubblicazione: {new Date(book.publication).toLocaleDateString()}</span>}
                  {/* (book.edition_num !== 0) && <span className="counter">Edizione: {book.edition_num}</span> */}
                  {(book.pages_num !== 0) && <span className="counter">Pagine: {book.pages_num}</span>}
                  {/* book.format && <span className="counter">Formato: {book.format}</span> */}
                  {book.genres && book.genres[0] && <span className="counter">Genere: {joinToLowerCase(book.genres)}</span>}
                </div>
                <div className="info-row">
                  <Rating labels={true} ratings={{ratings_num: book.ratings_num, rating_num: book.rating_num}}/>
                </div>
                <div className="info-row">
                  {userBook.bookInShelf ? 
                    <button className="btn success error-on-hover" onClick={this.onRemoveBookFromShelf}>
                      <span className="hide-on-hover">Aggiunto a libreria</span>
                      <span className="show-on-hover">Rimuovi da libreria</span>
                    </button>
                  :
                    <button className="btn primary" onClick={this.onAddBookToShelf}>Aggiungi a libreria</button>
                  }
                  {userBook.bookInWishlist && 
                    <button className="btn success error-on-hover" onClick={this.onRemoveBookFromWishlist}>
                      <span className="hide-on-hover">Aggiunto a lista desideri</span>
                      <span className="show-on-hover">Rimuovi da lista desideri</span>
                    </button>
                  }
                  {(!userBook.bookInWishlist && !userBook.bookInShelf) &&
                    <button className="btn flat" onClick={this.onAddBookToWishlist}>Aggiungi a lista desideri</button>
                  }
                </div>
                <div className="info-row">
                  {userBook.bookInShelf &&
                    <div className="user rating">
                      <Rater total={5} onRate={rate => this.onRateBook(rate)} rating={userBook.rating_num || 0} />
                      {/* <span className="rating-num">{userBook.rating_num || 0}</span> */}
                      <span className="label">Il tuo voto</span>
                    </div>
                  }
                </div>
                {book.description && 
                  <div className="info-row">
                    <p className={`description ${isMinified ? 'minified' : 'expanded'}`}>{book.description || ''}</p>
                    {isMinified && <p><button className="link" onClick={this.onMinify}>Mostra tutto</button></p>}
                  </div>
                }
                <div>&nbsp;</div>
                <div className="info-row">
                  <span className="counter">Lettori: {book.readers_num}</span>
                  <span className="counter">Recensioni: {book.reviews_num}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
		);
	}
}

BookProfile.propTypes = {
  addBookToShelf: funcType.isRequired,
  addBookToWishlist: funcType.isRequired,
  removeBookFromShelf: funcType.isRequired,
  removeBookFromWishlist: funcType.isRequired,
  rateBook: funcType.isRequired,
  isEditing: funcType.isRequired,
  userBook: userBookType.isRequired
}