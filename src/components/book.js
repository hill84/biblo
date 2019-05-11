import CircularProgress from '@material-ui/core/CircularProgress';
import React, { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { authid, bookRef, collectionBookRef, isAuthenticated, reviewerRef, userBookRef, userRef } from '../config/firebase';
import { app, handleFirestoreError } from '../config/shared';
import { bookType, funcType, objectType, stringType, userBookType, userType } from '../config/types';
import NoMatch from './noMatch';
const BookForm = lazy(() => import('./forms/bookForm'));
const BookProfile = lazy(() => import('./pages/bookProfile'));

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
    seo: this.props.book && {
      author: Object.keys(this.props.book.authors),
      description: `Scopri su ${app.name} la trama e le recensioni di ${this.props.book.title}, scritto da ${Object.keys(this.props.book.authors)[0]}, pubblicato da ${this.props.book.publisher}`,
      image: this.props.book.covers.length && this.props.book.covers[0],
      isbn: this.props.book.ISBN_13,
      rating: { scale: '5', value: this.props.book.rating_num },
      release_date: this.props.book.publication ? new Date(this.props.book.publication).toLocaleDateString() : '',
      title: `${this.props.book.title} di ${Object.keys(this.props.book.authors)[0]} - ${this.props.book.publisher} - ${app.name}`,
      url: `${app.url}/book/${this.props.book.bid}`,
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
        seo: {
          author: Object.keys(props.book.authors),
          description: `Scopri su ${app.name} la trama e le recensioni di ${props.book.title}, scritto da ${Object.keys(props.book.authors)[0]}, pubblicato da ${props.book.publisher}`,
          image: props.book.covers.length && props.book.covers[0],
          isbn: props.book.ISBN_13,
          rating: { scale: '5', value: props.book.rating_num },
          release_date: props.book.publication ? new Date(props.book.publication).toLocaleDateString() : '',
          title: `${props.book.title} di ${Object.keys(props.book.authors)[0]} - ${props.book.publisher} - ${app.name}`,
          url: `${app.url}/book/${props.book.bid}`,
        },
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
      if (this.props.bid !== prevProps.bid){
        this.setState({ loading: true });
        this.unsubBookUpdate = bookRef(this.props.bid).onSnapshot(snap => {
          if (snap.exists) {
            // console.log(snap.data());
            this.setState({
              book: {
                ...book,
                ...snap.data()
              },
              seo: {
                author: Object.keys(book.authors),
                description: `Scopri su ${app.name} la trama e le recensioni di ${book.title}, scritto da ${Object.keys(book.authors)[0]}, pubblicato da ${book.publisher}`,
                image: book.covers.length && book.covers[0],
                isbn: book.ISBN_13,
                rating: { scale: '5', value: book.rating_num },
                release_date: book.publication ? new Date(book.publication).toLocaleDateString() : '',
                title: `${book.title} di ${Object.keys(book.authors)[0]} - ${book.publisher} - ${app.name}`,
                url: `${app.url}/book/${book.bid}`,
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
            seo: {
              author: Object.keys(snap.data().authors),
              description: `Scopri su ${app.name} la trama e le recensioni di ${snap.data().title}, scritto da ${Object.keys(snap.data().authors)[0]}, pubblicato da ${snap.data().publisher}`,
              image: snap.data().covers.length && snap.data().covers[0],
              isbn: snap.data().ISBN_13,
              rating: { scale: '5', value: snap.data().rating_num },
              release_date: snap.data().publication ? new Date(snap.data().publication).toLocaleDateString() : '',
              title: `${snap.data().title} di ${Object.keys(snap.data().authors)[0]} - ${snap.data().publisher} - ${app.name}`,
              url: `${app.url}/book/${snap.data().bid}`,
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
    const { book, isEditing, loading, seo, user, userBook } = this.state;
    const { history, location, openSnackbar } = this.props;

    if (!loading && !book) return <NoMatch title="Libro non trovato" history={history} location={location} />

		return (
      <React.Fragment>
        {seo &&
          <Helmet>
            <title>{app.name} | {book.title || 'Libro'}</title>
            <link rel="canonical" href={seo.url} />
            <meta name="description" content={seo.description} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:type" content="books.book" />
            <meta property="og:url" content={seo.url} />
            <meta property="og:title" content={seo.title} />
            {book.covers.length && <meta property="og:image" content={seo.image} />}
            <meta property="book:author" content={seo.author} />
            <meta property="book:isbn" content={seo.isbn} />
            <meta property="book:release_date" content={seo.release_date} />
            <meta property="books:rating:value" content={seo.rating.value} />
            <meta property="books:rating:scale" content={seo.rating.scale} />
          </Helmet>
        }
        <Suspense fallback={<div aria-hidden="true" className="loader"><CircularProgress /></div>}>
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
        </Suspense>
      </React.Fragment>
		);
	}
}