import React from 'react';
import { bookType, stringType, userType } from '../config/types';
import { bookRef, collectionsRef, local_uid, userBookRef, userRef } from '../config/firebase';
import BookForm from './forms/bookForm';
import BookProfile from './pages/bookProfile';

export default class Book extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: this.props.book || null,
      userBook: {
        authors: (this.props.book && this.props.book.authors) || [],
        covers: (this.props.book && [this.props.book.covers[0]]) || [],
        publisher: (this.props.book && this.props.book.publisher) || '',
        title: (this.props.book && this.props.book.title) || '',
        subtitle: (this.props.book && this.props.book.subtitle) || '',
        review: '',
        readingState: '',
        rating_num: 0,
        bookInShelf: false,
        bookInWishlist: false 
      },
			isEditing: false
    }
    this.removeBookFromUserBooks = (bid, bookshelf) => {
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
  
      userBookRef(local_uid, bid).delete().then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: false, 
            bookInWishlist: false,
            rating_num: userBookRating_num
          }
        });
        //console.log(`Book removed from user ${bookshelf}`);
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
  
      if (bookshelf === 'shelf') {
        //console.log('will remove book and rating from user shelf stats');
        userRef(local_uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            shelf_num: userShelf_num,
            ratings_num: userRatings_num
          }
        }).then(() => {
          //console.log('Book and rating removed from user shelf stats');
        }).catch(error => console.warn(error));
        if (this.state.book.collections) {
          this.state.book.collections.forEach(cid => {
            collectionsRef(cid).doc(this.state.book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).then(() => {
              //console.log(`updated book rating in "${cid}" collection`)
            }).catch(error => console.warn(error));
          });
        };
      } else if (bookshelf === 'wishlist') {
        //console.log('will remove book from user wishlist stats');
        userRef(local_uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            wishlist_num: userWishlist_num
          }
        }).then(() => {
          //console.log('Book removed from user wishlist stats');
        }).catch(error => console.warn(error));
      } else console.warn(`no bookshelf named "${bookshelf}"`);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      if (nextProps.book) {
        this.setState({
          book: nextProps.book,
          userBook: {
            ...this.state.userBook,
            authors: nextProps.book.authors || [],
            covers: [nextProps.book.covers[0]] || [],
            publisher: nextProps.book.publisher || '',
            title: nextProps.book.title || '',
            subtitle: nextProps.book.subtitle || ''
          }
        });
      } else if (nextProps.bid) {
        bookRef(nextProps.bid).onSnapshot(snap => {
          if (snap.exists) {
            //console.log(snap.data());
            this.setState({
              book: {
                ...this.state.book,
                ...snap.data()
              },
              userBook: {
                ...this.state.userBook,
                authors: snap.data().authors || [],
                covers: [snap.data().covers[0]] || [],
                publisher: snap.data().publisher || '',
                title: snap.data().title || '',
                subtitle: snap.data().subtitle || ''
              }
            });
          } else { console.warn('No book with bid ' + nextProps.bid); }
        });
      }
      if (nextProps.bid || nextProps.book.bid) {
        userBookRef(local_uid, (nextProps.bid || nextProps.book.bid)).onSnapshot(snap => {
          //console.log(`Update userBook ${nextProps.bid || nextProps.book.bid} again`);
          if (snap.exists) {
            this.setState({
              userBook: snap.data()
            });
          } else {
            this.setState({
              userBook: {
                bid: '',
                authors: [],
                covers: [],
                publisher: '',
                title: '',
                subtitle: '',
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
    if (this.props.bid || this.state.book.bid) {
      userBookRef(local_uid, (this.props.bid || this.state.book.bid)).onSnapshot(snap => {
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
        } else console.warn(`No book with bid ${this.props.bid}`);
      });
    }
  }
  
  addBookToShelf = bid => {
    let userWishlist_num = this.props.user.stats.wishlist_num;
    const bookReaders_num = this.state.book.readers_num + 1;

    if (this.state.userBook.bookInWishlist) {
      userWishlist_num -= 1;
    }
    
    userBookRef(local_uid, bid).set({
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
      //console.log('Book added to user shelf');
    }).catch(error => console.warn(error));

    bookRef(bid).update({
      readers_num: bookReaders_num
    }).then(() => {
      this.setState({ 
        book: { 
          ...this.state.book, 
          readers_num: bookReaders_num 
        }
      });
      //console.log('Readers number increased');
    }).catch(error => console.warn(error));

    userRef(local_uid).update({
      'stats.shelf_num': this.props.user.stats.shelf_num + 1,
      'stats.wishlist_num': userWishlist_num
    }).then(() => {
      //console.log('User shelf number increased');
    }).catch(error => console.warn(error));
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

    userBookRef(local_uid, bid).set({
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

    userRef(local_uid).update({
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
    
    /* console.log({
      'bookRating_num': bookRating_num,
      'bookRatings_num': bookRatings_num,
      'rate': rate,
      'userRatings_num': userRatings_num,
      'userBookRating_num': userBookRating_num
    }); */

    if (userBookRating_num === 0) { 
      bookRating_num = (bookRating_num === 0) ? rate : (bookRating_num + rate) / bookRatings_num;
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

    if (this.state.book.collections) {
      this.state.book.collections.forEach(cid => {
        //console.log(cid);
        collectionsRef(cid).doc(this.state.book.bid).update({
          rating_num: bookRating_num, 
          ratings_num: bookRatings_num
        }).then(() => {
          //console.log(`updated book rating in "${cid}" collection`)
        }).catch(error => console.warn(error));
      });
    };

    userBookRef(local_uid, bid).update({
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

    userRef(local_uid).update({
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
            user={this.props.user}
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
            user={this.props.user}
          />
        }
			</div>
		);
	}
}

Book.propTypes = {
  bid: stringType,
  book: bookType,
  user: userType
}