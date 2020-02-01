import React, { Component, createRef, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { bookRef, collectionBookRef, reviewerRef, userBookRef, userRef } from '../config/firebase';
import { app, handleFirestoreError, normURL } from '../config/shared';
import { bookType, boolType, funcType, objectType, stringType, /* userBookType, */ userType } from '../config/types';
import BookForm from './forms/bookForm';
import BookProfile from './pages/bookProfile';

const NoMatch = lazy(() => import('./noMatch'));

const max = {
  shelfBooks: {
    premium: 2000,
    standard: 1000
  },
  wishlistBooks: {
    premium: 1000,
    standard: 500
  }
}

export default class Book extends Component {
  state = {
    book: this.props.book,
    userBook: {
      bid: '',
      authors: [],
      covers: [],
      genres: [],
      pages_num: 0,
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
      url: `${app.url}/book/${this.props.book.bid}/${normURL(this.props.book.title)}`,
    },
    isEditing: this.props.isEditing,
    loading: false
  }
  addBookToShelfRef = createRef();
  addBookToWishlistRef = createRef();
	
  static propTypes = {
    bid: stringType,
    book: bookType,
    history: objectType.isRequired,
    isAuth: boolType,
    isEditing: boolType,
    location: objectType.isRequired,
    openSnackbar: funcType.isRequired,
    user: userType,
    // userBook: userBookType
  }

  static defaultProps = {
    bid: null,
    book: null,
    isAuth: false,
    isEditing: false,
    user: null,
    // userBook: null
  }

  static getDerivedStateFromProps(props, state) {
    if (props.book && (props.book !== state.book)) { 
      return { 
        /* book: props.book,
        seo: {
          author: Object.keys(props.book.authors),
          description: `Scopri su ${app.name} la trama e le recensioni di ${props.book.title}, scritto da ${Object.keys(props.book.authors)[0]}, pubblicato da ${props.book.publisher}`,
          image: props.book.covers.length && props.book.covers[0],
          isbn: props.book.ISBN_13,
          rating: { scale: '5', value: props.book.rating_num },
          release_date: props.book.publication ? new Date(props.book.publication).toLocaleDateString() : '',
          title: `${props.book.title} di ${Object.keys(props.book.authors)[0]} - ${props.book.publisher} - ${app.name}`,
          url: `${app.url}/book/${props.book.bid}/${normURL(props.book.title)}`,
        }, */
        userBook: {
          ...state.userBook,
          bid: props.book.bid,
          authors: props.book.authors,
          covers: !!props.book.covers[0] && Array(props.book.covers[0]),
          genres: props.book.genres,
          pages_num: props.book.pages_num,
          publisher: props.book.publisher,
          title: props.book.title,
          subtitle: props.book.subtitle
        }
      }; 
    }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    const { bid } = this.props;

    if (bid) {
      if (this._isMounted) this.setState({ loading: true });
      
      this.unsubBookFetch = bookRef(bid).onSnapshot(snap => {
        if (snap.exists) {
          if (this._isMounted) {
            this.setState(prevState => ({
              book: {
                ...prevState.book,
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
                url: `${app.url}/book/${snap.data().bid}/${normURL(snap.data().title)}`,
              },
              userBook: {
                ...prevState.userBook,
                bid: snap.data().bid,
                authors: snap.data().authors,
                covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
                genres: snap.data().genres,
                pages_num: snap.data().pages_num,
                publisher: snap.data().publisher,
                title: snap.data().title,
                subtitle: snap.data().subtitle || ''
              }
            }));
          }
        } else console.warn(`No book with bid ${bid}`);
        this.setState({ loading: false }, () => this.fetchUserBook(bid || this.state.book.bid));
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.bid !== prevProps.bid) {
      if (this._isMounted) this.setState({ loading: true });
      
      this.unsubBookUpdate = bookRef(this.props.bid).onSnapshot(snap => {
        if (snap.exists) {
          if (this._isMounted) {
            this.setState({
              book: {
                ...prevState.book,
                ...snap.data()
              },
              seo: {
                author: Object.keys(prevState.book.authors),
                description: `Scopri su ${app.name} la trama e le recensioni di ${prevState.book.title}, scritto da ${Object.keys(prevState.book.authors)[0]}, pubblicato da ${prevState.book.publisher}`,
                image: prevState.book.covers.length && prevState.book.covers[0],
                isbn: prevState.book.ISBN_13,
                rating: { scale: '5', value: prevState.book.rating_num },
                release_date: prevState.book.publication ? new Date(prevState.book.publication).toLocaleDateString() : '',
                title: `${prevState.book.title} di ${Object.keys(prevState.book.authors)[0]} - ${prevState.book.publisher} - ${app.name}`,
                url: `${app.url}/book/${prevState.book.bid}/${normURL(prevState.book.title)}`,
              },
              userBook: {
                ...prevState.userBook,
                bid: snap.data().bid,
                authors: snap.data().authors,
                covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
                genres: snap.data().genres,
                pages_num: snap.data().pages_num,
                publisher: snap.data().publisher,
                title: snap.data().title,
                subtitle: snap.data().subtitle || ''
              }
            });
          }
        } else console.warn(`No book with bid ${this.props.bid}`);
        
        this.setState({ loading: false }, () => {
          this.fetchUserBook(this.props.bid);
        });
      });
    }
    if (this.props.user && (this.props.user.uid !== (prevProps.user && prevProps.user.uid))) {
      this.fetchUserBook(this.props.bid);
    }
  }

  componentWillUnmount () {
    this._isMounted = false;
    this.unsubBookFetch && this.unsubBookFetch();
    this.unsubBookUpdate && this.unsubBookUpdate();
    this.unsubUserBookFetch && this.unsubUserBookFetch();
  }
  
  fetchUserBook = bid => {
    const { isAuth, user } = this.props;
    const authid = user && user.uid;
    // console.log('fetchUserBook');

    if (authid && isAuth && bid) {
      this.unsubUserBookFetch = userBookRef(authid, bid).onSnapshot(snap => {
        if (snap.exists) {
          if (this._isMounted) {
            this.setState({ userBook: snap.data() });
          }
        } else if (this._isMounted) {
          this.setState(prevState => ({
            userBook: { 
              ...prevState.userBook,
              review: {},
              readingState: { state_num: 1 },
              rating_num: 0,
              bookInShelf: false,
              bookInWishlist: false 
            }
          }));
        }
      });
    }
  }
  
  addBookToShelf = bid => {
    const { isAuth, openSnackbar, user } = this.props;
    const authid = user && user.uid;

    if (isAuth) {
      this.addBookToShelfRef.current.setAttribute('disabled', 'disabled');
      let userWishlist_num = user.stats.wishlist_num;
      const userShelf_num = user.stats.shelf_num + 1;
      const bookReaders_num = this.state.book.readers_num + 1;

      if (this.state.userBook.bookInWishlist) {
        userWishlist_num -= 1;
      }

      const isAdmin = user.roles.admin;
      const isPremium = user.roles.premium;
      const maxShelfBooks = isPremium || isAdmin ? max.shelfBooks.premium : max.shelfBooks.standard;

      if (userShelf_num > maxShelfBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxShelfBooks} libri`}`, 'error');
      } else {
        userBookRef(authid, bid).set({
          ...this.state.userBook,
          added_num: Date.now(),
          bookInShelf: true,
          bookInWishlist: false
        }).then(() => {
          openSnackbar('Libro aggiunto in libreria', 'success');
  
          bookRef(bid).update({
            readers_num: bookReaders_num
          }).then(() => {
            // console.log(`Readers number increased to ${this.state.book.readers_num}`);
            
            userRef(authid).update({
              'stats.shelf_num': user.stats.shelf_num + 1,
              'stats.wishlist_num': userWishlist_num
            }).then(() => {
              // console.log('User shelf number increased');
              this.addBookToShelfRef.current && this.addBookToShelfRef.current.removeAttribute('disabled');
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }      
    } else console.warn(`Cannot addBookToShelf. User not authenticated`);
	}

	addBookToWishlist = bid => {
    const { isAuth, openSnackbar, user } = this.props;
    const authid = user && user.uid;

    if (isAuth) {
      this.addBookToWishlistRef.current.setAttribute('disabled', 'disabled');
      const userWishlist_num = user.stats.wishlist_num + 1;
      const isAdmin = user.roles.admin;
      const isPremium = user.roles.premium;
      const maxWishlistBooks = isPremium || isAdmin ? max.wishlistBooks.premium : max.wishlistBooks.standard;

      if (userWishlist_num > maxWishlistBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxWishlistBooks} libri`}`, 'error');
      } else {
        /* let userShelf_num = user.stats.shelf_num;
        let bookReaders_num = this.state.book.readers_num;
        let bookRating_num = this.state.book.rating_num;
        let bookRatings_num = this.state.book.ratings_num;
        let userRatings_num = user.stats.ratings_num;
        let userBookRating_num = this.state.userBook.rating_num;
        let bookReviews_num = this.state.book.reviews_num;
        let userBookReview = this.state.userBook.review; 
        
        if (this.state.userBook.bookInShelf) {
          userShelf_num -= 1;
          bookReaders_num -= 1;
        }
        
        if (this.state.book.rating_num > 0) {
          bookRating_num -= userBookRating_num;
          bookRatings_num -= 1;
          userRatings_num -= 1;
        }
        
        if (this.state.userBook.review !== {}) {
          bookReviews_num -= 1;
          userBookReview = {};
        } */
        userBookRef(authid, bid).set({
          ...this.state.userBook,
          /* rating_num: userBookRating_num,
          review: userBookReview, */
          added_num: Date.now(),
          bookInShelf: false,
          bookInWishlist: true
        }).then(() => {
          /* if (this._isMounted) {
            this.setState(prevState => ({ 
              userBook: { 
                ...prevState.userBook, 
                rating_num: userBookRating_num,
                review: userBookReview,
                bookInShelf: false,
                bookInWishlist: true 
              }
            })); 
          } */
          // console.log('Book added to user wishlist');
          this.addBookToWishlistRef.current && this.addBookToWishlistRef.current.removeAttribute('disabled');
          openSnackbar('Libro aggiunto in lista desideri', 'success');
          userRef(authid).update({
            /* 'stats.shelf_num': userShelf_num, */
            'stats.wishlist_num': userWishlist_num,
            /* 'stats.ratings_num': userRatings_num
          }).then(() => {
            // console.log('User wishlist number increased');
            /* bookRef(bid).update({
              rating_num: bookRating_num,
              ratings_num: bookRatings_num,
              readers_num: bookReaders_num
            }).then(() => {
              if (this._isMounted) {
                this.setState(prevState => ({ 
                  book: { 
                    ...prevState.book,
                    ratings_num: bookRatings_num,
                    readers_num: bookReaders_num
                  },
                  userBook: { 
                    ...prevState.userBook, 
                    rating_num: userBookRating_num 
                  }
                }));
              }
              //console.log('Rating and reader removed');
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error')); */
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    } else console.warn(`Cannot addBookToWishlist. User not authenticated`);
  }

	removeBookFromShelf = bid => this.removeBookFromUserBooks(bid, 'shelf');

  removeBookFromWishlist = bid => this.removeBookFromUserBooks(bid, 'wishlist');
  
  removeBookFromUserBooks = (bid, bookshelf) => {
    const { isAuth, openSnackbar, user } = this.props;
    const { book, userBook } = this.state;
    const authid = user && user.uid;

    if (isAuth) {
      let userShelf_num = user.stats.shelf_num;
      let userWishlist_num = user.stats.wishlist_num;
      let bookRating_num = book.rating_num;
      let bookRatings_num = book.ratings_num;
      let bookReaders_num = book.readers_num;
      let bookReviews_num = book.reviews_num;
      let userRatings_num = user.stats.ratings_num;
      let userBookRating_num = userBook.rating_num;
      let { review } = userBook;
  
      if (userBook.bookInShelf) {
        userShelf_num -= 1;
        bookReaders_num -= 1;
      } else {
        userWishlist_num -= 1;
      }
  
      if (userBook.rating_num > 0) {
        bookRating_num -= userBookRating_num;
        bookRatings_num -= 1;
        userRatings_num -= 1;
        userBookRating_num = 0;
      }
      
      if (userBook.review.created_num) {
        bookReviews_num -= 1;
        review = {};
      }
      
      userBookRef(authid, bid).delete().then(() => {
        if (this._isMounted) {
          this.setState(prevState => ({ 
            userBook: { 
              ...prevState.userBook, 
              bookInShelf: false, 
              bookInWishlist: false,
              rating_num: userBookRating_num,
              readingState: { state_num: 1 },
              review
            }
          }));
        }
        // console.log(`Book removed from user ${bookshelf}`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  
      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        readers_num: bookReaders_num
      }).then(() => {
        if (this._isMounted) {
          this.setState(prevState => ({ 
            book: { 
              ...prevState.book, 
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num,
              readers_num: bookReaders_num,
              review,
              reviews_num: bookReviews_num
            }
          }));
        }
        // console.log('Rating and reader removed');
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  
      if (bookshelf === 'shelf') {
        // console.log('will remove book and rating from user shelf stats');
        userRef(authid).update({
          ...user,
          stats: {
            ...user.stats,
            shelf_num: userShelf_num,
            ratings_num: userRatings_num
          }
        }).then(() => {
          // console.log('Book and rating removed from user shelf stats');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

        if (this.state.userBook.review.created_num) {
          reviewerRef(bid, authid).delete().then(() => {
            if (this._isMounted) {
              this.setState(prevState => ({ 
                userBook: { 
                  ...prevState.userBook, 
                  review
                }
              }));
            }
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
          ...user,
          stats: {
            ...user.stats,
            wishlist_num: userWishlist_num
          }
        }).then(() => {
          // console.log('Book removed from user wishlist stats');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn(`no bookshelf named "${bookshelf}"`);
    } else console.warn(`Cannot removeBookFromUserBooks. User not authenticated`);
  }

	rateBook = (bid, rate) => {
    const { isAuth, openSnackbar, user } = this.props;
    const authid = user && user.uid;

    if (isAuth) {
      let bookRating_num = this.state.book.rating_num;
      const userBookRating_num = this.state.userBook.rating_num;
      let bookRatings_num = this.state.book.ratings_num; 
      let userRatings_num = user.stats.ratings_num; 
      
      /* console.log({
        'bookRating_num': bookRating_num,
        'bookRatings_num': bookRatings_num,
        'rate': rate,
        'userRatings_num': userRatings_num,
        'userBookRating_num': userBookRating_num
      }); */

      if (userBookRating_num === 0) {
        bookRating_num = (bookRating_num === 0) ? rate : (bookRating_num + rate);
        bookRatings_num += 1; 
        userRatings_num += 1; 
      } else {
        bookRating_num = bookRating_num - userBookRating_num + rate;
      }

      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num
      }).then(() => {
        if (this._isMounted) {
          this.setState(prevState => ({ 
            book: { 
              ...prevState.book, 
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }
          }));
        }
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
          if (this._isMounted) {
            this.setState(prevState => ({ 
              userBook: { 
                ...prevState.userBook, 
                rating_num: rate 
              }
            }));
          }
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
    if (this._isMounted) {
      this.setState(prevState => ({
        book: { ...prevState.book, reviews_num: prevState.book.reviews_num + 1 }
      }));
    }
  }

  removeReview = () => {
    if (this._isMounted) {
      this.setState(prevState => ({
        book: { ...prevState.book, reviews_num: prevState.book.reviews_num - 1 }
      }));
    }
  }

  isEditing = () => {
    if (this.state.book.EDIT.edit || this.props.user.roles.admin) {
      if (this._isMounted) {
        this.setState(prevState => ({ isEditing: !prevState.isEditing }));
      }
    } else console.warn('Cannot edit book. Book locked');
  }
	
	render() {
    const { book, isEditing, loading, seo, userBook } = this.state;
    const { history, isAuth, location } = this.props;

    if (!loading && !book) return <NoMatch title="Libro non trovato" history={history} location={location} />

    const bgStyle = book ? { backgroundImage: `url(${book.covers[0]})`, } : {};

		return (
      <>
        {seo && (
          <Helmet>
            <title>{app.name} | {book.title || 'Libro'}</title>
            <link rel="canonical" href={`${app.url}/genres`} />
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
        )}
        
        <div className="content-background reveal fadeIn delay4">
          <div className="bg" style={bgStyle} />
        </div>
        {isEditing && isAuth ? (
          <BookForm
            isEditing={this.isEditing}
            book={book}
          />
        ) : (
          <BookProfile 
            addBookToShelf={this.addBookToShelf} 
            addBookToShelfRef={this.addBookToShelfRef} 
            addBookToWishlist={this.addBookToWishlist} 
            addBookToWishlistRef={this.addBookToWishlistRef} 
            addReview={this.addReview}
            history={history}
            location={location}
            removeBookFromShelf={this.removeBookFromShelf} 
            removeBookFromWishlist={this.removeBookFromWishlist} 
            removeReview={this.removeReview}
            rateBook={this.rateBook}
            isEditing={this.isEditing}
            loading={loading}
            book={book}
            userBook={userBook}
          />
        )}
      </>
		);
	}
}