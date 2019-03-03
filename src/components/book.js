import React from 'react';
import { authid, bookRef, collectionBookRef, isAuthenticated, reviewerRef, userBookRef, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { bookType, funcType, objectType, stringType, userBookType, userType } from '../config/types';
import BookForm from './forms/bookForm';
import NoMatch from './noMatch';
import BookProfile from './pages/bookProfile';

export default class Book extends React.Component {
  state = {
    book: this.props.book,
    user: this.props.user,
    userBook: {
      bid: '',
      authors: [],
      covers: [],
      publisher: '',
      title: '',
      subtitle: '',
      review: {},
      readingState: { state_num: 1 },
      rating_num: 0,
      bookInShelf: false,
      bookInWishlist: false 
    },
    isEditing: this.props.isEditing || false,
    loading: false
  }
	
  static propTypes = {
    bid: stringType,
    book: bookType,
    history: objectType,
    location: objectType,
    openSnackbar: funcType.isRequired,
    user: userType,
    userBook: userBookType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user !== state.user) { return { user: props.user }; }
    if (props.book && (props.book !== state.book)) { 
      return { 
        book: props.book,
        userBook: {
          ...state.userBook,
          bid: props.book.bid,
          authors: props.book.authors,
          covers: !!props.book.covers[0] && Array(props.book.covers[0]),
          publisher: props.book.publisher,
          title: props.book.title,
          subtitle: props.book.subtitle
        }
      }; 
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { book, userBook } = this.state;

    if (this._isMounted) {
      if(this.props.bid !== prevProps.bid){
        this.setState({ loading: true });
        this.unsubBookUpdate = bookRef(this.props.bid).onSnapshot(snap => {
          if (snap.exists) {
            // console.log(snap.data());
            this.setState({
              book: {
                ...book,
                ...snap.data()
              },
              userBook: {
                ...userBook,
                bid: snap.data().bid || '',
                authors: snap.data().authors || {},
                covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
                publisher: snap.data().publisher || '',
                title: snap.data().title || '',
                subtitle: snap.data().subtitle || ''
              }
            });
          } else console.warn(`No book with bid ${this.props.bid}`);
          this.setState({ loading: false }, () => {
            this.fetchUserBook(this.props.bid);
          });
        })
      }
      if (this.props.book !== prevProps.book) {
        this.fetchUserBook(this.props.book.bid);
      }
    }
  }

  componentDidMount() {
    const { book, userBook } = this.state;
    const { bid } = this.props;

    this._isMounted = true;
    if (bid) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      this.unsubBookFetch = bookRef(bid).onSnapshot(snap => {
        if (snap.exists) {
          // console.log(snap.data());
          this.setState({
            book: {
              ...book,
              ...snap.data()
            },
            userBook: {
              ...userBook,
              bid: snap.data().bid || '',
              authors: snap.data().authors,
              covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
              publisher: snap.data().publisher,
              title: snap.data().title,
              subtitle: snap.data().subtitle
            }
          });
        } else console.warn(`No book with bid ${bid}`);
        this.setState({ loading: false }, () => this.fetchUserBook(bid || book.bid));
      });
    }
  }

  componentWillUnmount () {
    this._isMounted = false;
    this.unsubBookFetch && this.unsubBookFetch();
    this.unsubBookUpdate && this.unsubBookUpdate();
    this.unsubUserBookFetch && this.unsubUserBookFetch();
  }
  
  fetchUserBook = bid => {
    if (isAuthenticated() && bid) {
      this.unsubUserBookFetch = userBookRef(authid, bid).onSnapshot(snap => {
        if (snap.exists) {
          this.setState({ userBook: snap.data() });
          // console.log(snap.data());
        }
      });
    }
  }
  
  addBookToShelf = bid => {
    const { openSnackbar } = this.props;

    if (isAuthenticated()) {
      let userWishlist_num = this.props.user.stats.wishlist_num;
      const bookReaders_num = this.state.book.readers_num + 1;

      if (this.state.userBook.bookInWishlist) {
        userWishlist_num -= 1;
      }
      
      userBookRef(authid, bid).set({
        ...this.state.userBook,
        added_num: Number(new Date().getTime()),
        bookInShelf: true,
        bookInWishlist: false
      }).then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: true, 
            bookInWishlist: false 
          }
        }, () => openSnackbar('Libro aggiunto in libreria', 'success'));
        bookRef(bid).update({
          readers_num: bookReaders_num
        }).then(() => {
          this.setState({ 
            book: { 
              ...this.state.book, 
              readers_num: bookReaders_num 
            }
          });
          // console.log('Readers number increased');
          
          userRef(authid).update({
            'stats.shelf_num': this.props.user.stats.shelf_num + 1,
            'stats.wishlist_num': userWishlist_num
          }).then(() => {
            // console.log('User shelf number increased');
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn(`Cannot addBookToShelf. User not authenticated`);
	}

	addBookToWishlist = bid => {
    const { openSnackbar } = this.props;

    if (isAuthenticated()) {
      const userWishlist_num = this.props.user.stats.wishlist_num + 1;
      /* let userShelf_num = this.props.user.stats.shelf_num;
      let bookReaders_num = this.state.book.readers_num;
      let bookRating_num = this.state.book.rating_num;
      let bookRatings_num = this.state.book.ratings_num;
      let userRatings_num = this.props.user.stats.ratings_num;
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

      if (this.state.userBook.review !== {}) {
        userReviews_num -= 1;
        bookReviews_num -= 1;
        userBookReview = {};
      } */
      userBookRef(authid, bid).set({
        ...this.state.userBook,
        /* rating_num: userBookRating_num,
        review: userBookReview, */
        added_num: Number(new Date().getTime()),
        bookInShelf: false,
        bookInWishlist: true
      }).then(() => {
        /* this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            rating_num: userBookRating_num,
            review: userBookReview,
            bookInShelf: false,
            bookInWishlist: true 
          }
        }); */
        // console.log('Book added to user wishlist');
        openSnackbar('Libro aggiunto in lista desideri', 'success');
        userRef(authid).update({
          /* 'stats.shelf_num': userShelf_num, */
          'stats.wishlist_num': userWishlist_num,
          /* 'stats.ratings_num': userRatings_num,
          'stats.reviews_num': userReviews_num */
        }).then(() => {
          // console.log('User wishlist number increased');
          /* bookRef(bid).update({
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
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error')); */
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn(`Cannot addBookToWishlist. User not authenticated`);
  }

	removeBookFromShelf = bid => this.removeBookFromUserBooks(bid, 'shelf');

  removeBookFromWishlist = bid => this.removeBookFromUserBooks(bid, 'wishlist');
  
  removeBookFromUserBooks = (bid, bookshelf) => {
    const { openSnackbar, user } = this.props;
    const { book, userBook } = this.state;

    if (isAuthenticated()) {
      let userShelf_num = user.stats.shelf_num;
      let userWishlist_num = user.stats.wishlist_num;
      let bookRating_num = book.rating_num;
      let bookRatings_num = book.ratings_num;
      let bookReaders_num = book.readers_num;
      let bookReviews_num = book.reviews_num;
      let userReviews_num = user.stats.reviews_num;
      let userRatings_num = user.stats.ratings_num;
      let userBookRating_num = userBook.rating_num;
      let review = userBook.review;
  
      if (userBook.bookInShelf) {
        userShelf_num -= 1;
        bookReaders_num -= 1;
      } else {
        userWishlist_num -= 1;
      }
  
      if (book.rating_num !== 0) {
        bookRating_num -= userBookRating_num;
        bookRatings_num -= 1;
        userRatings_num -= 1;
        userBookRating_num = 0;
      }
  
      if (book.reviews_num !== 0) {
        bookReviews_num -= 1;
        userReviews_num -= 1;
      }

      if (userBook.review.created_num) {
        review = {};
      }
      
      userBookRef(authid, bid).delete().then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: false, 
            bookInWishlist: false,
            rating_num: userBookRating_num,
            readingState: { state_num: 1 },
            review
          }
        });
        // console.log(`Book removed from user ${bookshelf}`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  
      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        readers_num: bookReaders_num,
        reviews_num: bookReviews_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num,
            readers_num: bookReaders_num,
            review,
            reviews_num: bookReviews_num
          }
        });
        // console.log('Rating and reader removed');
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  
      if (bookshelf === 'shelf') {
        // console.log('will remove book and rating from user shelf stats');
        userRef(authid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            shelf_num: userShelf_num,
            reviews_num: userReviews_num,
            ratings_num: userRatings_num
          }
        }).then(() => {
          // console.log('Book and rating removed from user shelf stats');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

        if (this.state.userBook.review.created_num) {
          reviewerRef(bid, authid).delete().then(() => {
            this.setState({ 
              userBook: { 
                ...this.state.userBook, 
                review
              }
            });
            // console.log(`Review removed from book`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }

        if (this.state.book.collections) {
          this.state.book.collections.forEach(cid => {
            collectionBookRef(cid, this.state.book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).then(() => {
              // console.log(`updated book rating in "${cid}" collection`)
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          });
        };
      } else if (bookshelf === 'wishlist') {
        // console.log('will remove book from user wishlist stats');
        userRef(authid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            wishlist_num: userWishlist_num
          }
        }).then(() => {
          // console.log('Book removed from user wishlist stats');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn(`no bookshelf named "${bookshelf}"`);
    } else console.warn(`Cannot removeBookFromUserBooks. User not authenticated`);
  }

	rateBook = (bid, rate) => {
    const { openSnackbar } = this.props;

    if (isAuthenticated()) {
      let bookRating_num = this.state.book.rating_num;
      const userBookRating_num = this.state.userBook.rating_num;
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
        // console.log(`Book rated with ${rate} stars`);

        if (this.state.book.collections) {
          this.state.book.collections.forEach(cid => {
            // console.log(cid);
            collectionBookRef(cid, this.state.book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).then(() => {
              // console.log(`updated book rating in "${cid}" collection`)
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          });
        };
  
        userBookRef(authid, bid).update({
          rating_num: rate
        }).then(() => {
          this.setState({ 
            userBook: { 
              ...this.state.userBook, 
              rating_num: rate 
            }
          });
          // console.log('User book rated with ' + rate + ' stars');

          userRef(authid).update({
            'stats.ratings_num': userRatings_num
          }).then(() => {
            // console.log('User ratings number increased');
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn(`Cannot rateBook. User not authenticated`);
  }
  
  addReview = () => {
    this.setState(prevState => ({
      book: { ...prevState.book, reviews_num: prevState.book.reviews_num + 1 }
    }));
  }

  removeReview = () => {
    this.setState(prevState => ({
      book: { ...prevState.book, reviews_num: prevState.book.reviews_num - 1 }
    }));
  }

  isEditing = () => {
    if (this.state.book.EDIT.edit || this.state.user.roles.admin) {
      this.setState(prevState => ({ isEditing: !prevState.isEditing }));
    } else console.warn('Cannot edit book. Book locked');
  }
	
	render() {
    const { book, isEditing, loading, user, userBook } = this.state;
    const { history, location, openSnackbar } = this.props;

    if (!loading && !book) return <NoMatch title="Libro non trovato" history={history} location={location} />

		return (
      <React.Fragment>
        {isEditing && isAuthenticated() ?
          <BookForm 
            openSnackbar={openSnackbar}
            isEditing={this.isEditing} 
            book={book} 
            user={user}
          />
        :
          <BookProfile 
            openSnackbar={openSnackbar}
            addBookToShelf={this.addBookToShelf} 
            addBookToWishlist={this.addBookToWishlist} 
            addReview={this.addReview}
            removeBookFromShelf={this.removeBookFromShelf} 
            removeBookFromWishlist={this.removeBookFromWishlist} 
            removeReview={this.removeReview}
            rateBook={this.rateBook}
            isEditing={this.isEditing}
            loading={loading}
            book={book}
            userBook={userBook}
            user={user}
          />
        }
      </React.Fragment>
		);
	}
}