import React from 'react';
import { bookType, stringType } from '../config/types';
import { bookRef, userBookRef, userRef } from '../config/firebase';
import BookForm from './forms/bookForm';
import BookProfile from './pages/bookProfile';

export default class Book extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: this.props.book || null,
      userBook: {
        review: '',
        readingState: '',
        rating_num: 0,
        bookInShelf: false,
        bookInWishlist: false 
      },
			isEditing: false
    }
    
    this.removeBookFromUserBooks = (bid, collection) => {
      let userShelf_num = this.props.user.stats.shelf_num;
      let userWishlist_num = this.props.user.stats.wishlist_num;
      let bookRating_num = this.state.book.rating_num;
      let bookRatings_num = this.state.book.ratings_num;
      let bookReaders_num = this.state.book.readers_num;
      let bookReviews_num = this.state.book.reviews_num;
      let userRatings_num = this.props.user.stats.ratings_num;
      let userBookRating_num = this.state.userBook.rating_num;

      if (this.state.userBook.bookInShelf) {
        userShelf_num -= 1;
        bookReaders_num -= 1;
      } else {
        userWishlist_num -= 1;
      }

      if (this.state.book.rating_num !== 0) {
        bookRating_num -= userBookRating_num;
        bookRatings_num -= 1;
        userRatings_num -= 1;
        userBookRating_num = 0;
      }

      if (this.state.book.reviews_num !== 0) {
        bookReviews_num -= 1;
      }

      //console.log(`Uid: ${this.props.uid}`);

      userBookRef(this.props.uid, bid).delete().then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: false, 
            bookInWishlist: false,
            rating_num: userBookRating_num
          }
        });
        //console.log(`Book removed from user ${collection}`);
      }).catch(error => console.warn(error));

      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        reviews_num: bookReviews_num,
        readers_num: bookReaders_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num,
            reviews_num: bookReviews_num,
            readers_num: bookReaders_num
          }
        });
        //console.log('Rating and reader removed');
      }).catch(error => console.warn(error));

      if (collection === 'shelf') {
        //console.log('will remove book and rating from user shelf stats');
        userRef(this.props.uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            shelf_num: userShelf_num,
            ratings_num: userRatings_num
          }
        }).then(() => {
          //console.log('Book and rating removed from user shelf stats');
        }).catch(error => console.warn(error));
      } else if (collection === 'wishlist') {
        //console.log('will remove book from user wishlist stats');
        userRef(this.props.uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            wishlist_num: userWishlist_num
          }
        }).then(() => {
          //console.log('Book removed from user wishlist stats');
        }).catch(error => console.warn(error));
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      if (nextProps.book) {
        this.setState({
          book: nextProps.book
        });
      } else if (nextProps.bid) {
        bookRef(nextProps.bid).onSnapshot(snap => {
          if (snap.exists) {
            //console.log(snap.data());
            this.setState({
              book: {
                ...this.state.book,
                ...snap.data()
              }
            });
          } else { console.warn('No book with bid ' + this.props.bid); }
        });
      }
      if (nextProps.uid) {
        userBookRef(nextProps.uid, (nextProps.bid || nextProps.book.bid)).onSnapshot(snap => {
          //console.log(`Update userBook ${nextProps.bid || nextProps.book.bid} again`);
          if (snap.exists) {
            this.setState({
              userBook: snap.data()
            });
          } else {
            this.setState({
              userBook: {
                review: '',
                readingState: '',
                rating_num: 0,
                bookInShelf: false,
                bookInWishlist: false 
              }
            });
          }
        });
      }
    }
  }

  componentDidMount(props) {
    if (this.props.uid && (this.props.bid || this.state.book)) {
      userBookRef(this.props.uid, (this.props.bid || this.state.book.bid)).onSnapshot(snap => {
        if (snap.exists) {
          //console.log(`Update userBook ${this.state.book.bid}`);
          this.setState({
            userBook: snap.data()
          });
        } 
      });
    }

    if (this.props.bid) {
      bookRef(this.props.bid).onSnapshot(snap => {
        if (snap.exists) {
          //console.log(snap.data());
          this.setState({
            book: {
              ...this.state.book,
              ...snap.data()
            }
          });
        } else { console.warn('No book with bid ' + this.props.bid); }
      });
    }
  }
  
  addBookToShelf = bid => {
    let userWishlist_num = this.props.user.stats.wishlist_num;
    const bookReaders_num = this.state.book.readers_num + 1;

    if (this.state.userBook.bookInWishlist) {
      userWishlist_num -= 1;
    }
    
    userBookRef(this.props.uid, bid).set({
      ...this.state.userBook,
      bookInShelf: true,
      bookInWishlist: false
    }).then(() => {
      this.setState({ 
        userBook: { 
          ...this.state.userBook, 
          bookInShelf: true, 
          bookInWishlist: false 
        }
      });
      console.log('Book added to user shelf');
    }).catch(error => console.log(error));

    bookRef(bid).update({
      readers_num: bookReaders_num
    }).then(() => {
      this.setState({ 
        book: { 
          ...this.state.book, 
          readers_num: bookReaders_num 
        }
      });
      console.log('Readers number increased');
    }).catch(error => console.log(error));

    userRef(this.props.uid).update({
      'stats.shelf_num': this.props.user.stats.shelf_num + 1,
      'stats.wishlist_num': userWishlist_num
    }).then(() => {
      console.log('User shelf number increased');
    }).catch(error => console.log(error));
	}

	addBookToWishlist = bid => {
    let userShelf_num = this.props.user.stats.shelf_num;
    let bookReaders_num = this.state.book.readers_num;
    let bookRating_num = this.state.book.rating_num;
    let bookRatings_num = this.state.book.ratings_num;
    let userRatings_num = this.props.user.stats.ratings_num;
    const userWishlist_num = this.props.user.stats.wishlist_num + 1;
    let userBookRating_num = this.state.userBook.rating_num;
    let userReviews_num = this.props.user.stats.reviews_num;
    let bookReviews_num = this.state.book.reviews_num;
    let userBookReview = this.state.userBook.review;

    if (this.state.userBook.bookInShelf) {
      userShelf_num -= 1;
      bookReaders_num -= 1;
    }

    if (this.state.book.rating_num !== 0) {
      bookRating_num -= userBookRating_num;
      bookRatings_num -= 1;
      userRatings_num -= 1;
    }

    if (this.state.userBook.review !== '') {
      userReviews_num -= 1;
      bookReviews_num -= 1;
      userBookReview = '';
    }

    userBookRef(this.props.uid, bid).set({
      ...this.state.userBook,
      rating_num: userBookRating_num,
      review: userBookReview,
      bookInShelf: false,
      bookInWishlist: true
    }).then(() => {
      this.setState({ 
        userBook: { 
          ...this.state.userBook, 
          rating_num: userBookRating_num,
          review: userBookReview,
          bookInShelf: false, 
          bookInWishlist: true 
        }
      });
      //console.log('Book added to user wishlist');
    }).catch(error => console.warn(error));

    userRef(this.props.uid).update({
      'stats.shelf_num': userShelf_num,
      'stats.wishlist_num': userWishlist_num,
      'stats.ratings_num': userRatings_num,
      'stats.reviews_num': userReviews_num
    }).then(() => {
      //console.log('User wishlist number increased');
    }).catch(error => console.warn(error));

    bookRef(bid).update({
      rating_num: bookRating_num,
      ratings_num: bookRatings_num,
      readers_num: bookReaders_num,
      reviews_num: bookReviews_num
    }).then(() => {
      this.setState({ 
        book: { 
          ...this.state.book,
          ratings_num: bookRatings_num,
          readers_num: bookReaders_num
        },
        userBook: { 
          ...this.state.userBook, 
          rating_num: userBookRating_num 
        }
      });
      //console.log('Rating and reader removed');
    }).catch(error => console.warn(error));
	}

	removeBookFromShelf = bid => this.removeBookFromUserBooks(bid, 'shelf');

	removeBookFromWishlist = bid => this.removeBookFromUserBooks(bid, 'wishlist');

	rateBook = (bid, rate) => {
    let bookRating_num = this.state.book.rating_num;
    let userBookRating_num = this.state.userBook.rating_num;
    let bookRatings_num = this.state.book.ratings_num; 
    let userRatings_num = this.props.user.stats.ratings_num; 
    
    if (bookRating_num === 0) { 
      bookRating_num += rate;
      bookRatings_num += 1; 
      userRatings_num += 1; 
    } else {
      bookRating_num = bookRating_num - userBookRating_num + rate;
    }

    bookRef(bid).update({
      rating_num: bookRating_num,
      ratings_num: bookRatings_num
    }).then(() => {
      this.setState({ 
        book: { 
          ...this.state.book, 
          rating_num: bookRating_num, 
          ratings_num: bookRatings_num
        }
      });
      //console.log('Book rated with ' + rate + ' stars');
    }).catch(error => console.warn(error));

    userBookRef(this.props.uid, bid).update({
      rating_num: rate
    }).then(() => {
      this.setState({ 
        userBook: { 
          ...this.state.userBook, 
          rating_num: rate 
        }
      });
      //console.log('User book rated with ' + rate + ' stars');
    }).catch(error => console.warn(error));

    userRef(this.props.uid).update({
      'stats.ratings_num': userRatings_num
    }).then(() => {
      //console.log('User ratings number increased');
    }).catch(error => console.warn(error));
	}

	isEditing = () => this.setState(prevState => ({ isEditing: !prevState.isEditing }));
	
	render() {
    const { book, isEditing, userBook } = this.state;

    if (!book) return null;

		return (
			<div ref="BookComponent">
        {isEditing ?
          <BookForm 
            isEditing={this.isEditing} 
            book={book} 
          />
        :
          <BookProfile 
            addBookToShelf={this.addBookToShelf} 
            addBookToWishlist={this.addBookToWishlist} 
            removeBookFromShelf={this.removeBookFromShelf} 
            removeBookFromWishlist={this.removeBookFromWishlist} 
            rateBook={this.rateBook}
            isEditing={this.isEditing}
            book={book}
            userBook={userBook}
          />
        }
			</div>
		);
	}
}

Book.propTypes = {
  uid: stringType,
  bid: stringType,
  book: bookType
}