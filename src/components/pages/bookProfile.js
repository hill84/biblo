import React from 'react';
import { CircularProgress } from 'material-ui';
import Rater from 'react-rater';
import { Link } from 'react-router-dom';
import { isAuthenticated, reviewsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { calcReadingTime, join, joinToLowerCase, timeSince } from '../../config/shared';
import { funcType, userBookType } from '../../config/types';
import Cover from '../cover';
import Rating from '../rating';
import Review from '../review';
import UserReview from '../userReview';

export default class BookProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: {
        ...this.props.book,
        bid: this.props.book.bid || ''
      },
      user: this.props.user || {},
      userBook: this.props.userBook,
      reviews: null,
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
        userBook: nextProps.userBook,
        user: nextProps.user
      });
      if (nextProps.book.bid !== this.props.book.bid) {
        this.fetchReviews(nextProps.book.bid);
      }
    }
  }

  componentWillMount(props) {
    if (this.props.book.description.length > 700) {
      this.setState({ isMinified: true });
    }
  }

  componentDidMount(props) {
    this.fetchReviews(this.state.book.bid);
  }

  fetchReviews = bid => {
    let reviews = [];
    reviewsRef(bid).orderBy('created_num').orderBy('likes_num').limit(10).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(review => reviews.push(review.data()));
        this.setState({ 
          reviews: reviews,
          loading: false,
          page: 1,
          //lastVisible: snap.docs[snap.docs.length-1]
        });
        //console.log(reviews);
      } else {
        this.setState({ 
          reviews: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
    }).catch(error => console.warn("Error fetching reviews:", error));
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
    const { book, isIncipitOpen, isMinified, reviews, user, userBook } = this.state;
    const reviewsStack = ((reviews && reviews.length > 0) ? 
      <div>
        {reviews.map(review => 
          <Review key={review.createdByUid} review={{
            photoURL: review.photoURL || '',
            displayName: review.displayName || '',
            createdByUid: review.createdByUid || '',
            created_num: review.created_num || 0,
            like: false,
            likes_num: review.likes_num || 0,
            rating_num: review.rating_num || 0,
            text: review.text || '',
            title: review.title || '',
          }} />
        )}
      </div>
    : 
      <div className="info-row empty text-align-center">Non ci sono ancora recensioni per questo libro.</div>
    );

		return (
      <div ref="BookProfileComponent">
        <div className="content-background"><div className="bg" style={{backgroundImage: `url(${book.covers[0]})`}}></div></div>
        <div className="container top">
          <div className="card main text-align-center-sm">
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
                  {user && user.roles && <button className="btn sm flat counter" onClick={this.onEditing}>Modifica</button>}
                </div>
                <div className="info-row">
                  <span className="counter">ISBN-13: {book.ISBN_13}</span>
                  {(book.ISBN_10 !== 0) && <span className="counter">ISBN-10: {book.ISBN_10}</span>}
                  {book.publication && <span className="counter">Pubblicazione: {new Date(book.publication).toLocaleDateString()}</span>}
                  {/* (book.edition_num !== 0) && <span className="counter">Edizione: {book.edition_num}</span> */}
                  {(book.pages_num !== 0) && <span className="counter">Pagine: {book.pages_num}</span>}
                  {/* book.format && <span className="counter">Formato: {book.format}</span> */}
                  {book.genres && book.genres[0] && <span className="counter">Gener{book.genres[1] ? 'i' : 'e'}: {joinToLowerCase(book.genres)}</span>}
                </div>

                <div className="info-row">
                  <Rating labels={true} ratings={{ratings_num: book.ratings_num, rating_num: book.rating_num}}/>
                </div>

                {isAuthenticated() &&
                  <div>
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
                  </div>
                }

                {book.description && 
                  <div className="info-row">
                    <p className={`description ${isMinified ? 'minified' : 'expanded'}`}>{book.description || ''}</p>
                    {isMinified && <p><button className="link" onClick={this.onMinify}>Mostra tutto</button></p>}
                  </div>
                }
                <div>&nbsp;</div>
                <div className="info-row">
                  <span className="counter">Lettori: {book.readers_num}</span>
                  {book.pages_num && <span className="counter">Lettura: {calcReadingTime(book.pages_num)}</span>}
                  <span className="counter">Recensioni: {book.reviews_num}</span>
                </div>
              </div>
              {book.EDIT &&
                <div className="edit-info">
                  {icon.informationOutline()}
                  <div className="show-on-hover">
                    {book.EDIT.lastEdit_num ? 
                      <span>Modificato da <Link to={`/dashboard/${book.EDIT.lastEditByUid}`}>{book.EDIT.lastEditBy}</Link> {timeSince(new Date(book.EDIT.lastEdit_num))}</span> 
                    : 
                      <span>Creato da <Link to={`/dashboard/${book.EDIT.createdByUid}`}>{book.EDIT.createdBy}</Link> {timeSince(new Date(book.EDIT.created_num))}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          {isAuthenticated() && <UserReview bid={book.bid} user={user} userBook={userBook} />}

          <div className="card dark reviews">{reviewsStack}</div>

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