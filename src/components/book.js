import React, { lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { bookRef, collectionBookRef, reviewerRef, userBookRef, userRef } from '../config/firebase';
import { app, handleFirestoreError, normURL } from '../config/shared';
import { bookType, boolType, objectType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
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
};

const unsub = {
  bookFetch: null,
  userBookFetch: null
};

const Book = props => {
  const { isAdmin, isAuth, isPremium, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, history, location } = props;
  const [book, setBook] = useState(props.book);
  const [isEditing, setIsEditing] = useState(props.isEditing);
  const [loading, setLoading] = useState(false);
  const [userBook, setUserBook] = useState({
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
  });
  const [seo, setSeo] = useState(props.book && {
    author: Object.keys(props.book.authors),
    description: `Scopri su ${app.name} la trama e le recensioni di ${props.book.title}, scritto da ${Object.keys(props.book.authors)[0]}, pubblicato da ${props.book.publisher}`,
    image: props.book.covers?.[0],
    isbn: props.book.ISBN_13,
    rating: { scale: '5', value: props.book.rating_num },
    release_date: props.book.publication ? new Date(props.book.publication).toLocaleDateString() : '',
    title: `${props.book.title} di ${Object.keys(props.book.authors)[0]} - ${props.book.publisher} - ${app.name}`,
    url: `${app.url}/book/${props.book.bid}/${normURL(props.book.title)}`,
  });
  const addBookToShelfRef = useRef(null);
  const addBookToWishlistRef = useRef(null);
  const is = useRef(true);

  const authid = useMemo(() => user?.uid, [user]);
  const _bid = useMemo(() => book?.bid, [book]);

  const fetchUserBook = useCallback(bid => {
    if (authid && isAuth && bid) {
      unsub.userBookFetch = userBookRef(authid, bid).onSnapshot(snap => {
        if (snap.exists) {
          if (is.current) {
            setUserBook(snap.data());
          }
        } else if (is.current) {
          setUserBook(userBook => ({ 
            ...userBook,
            review: {},
            readingState: { state_num: 1 },
            rating_num: 0,
            bookInShelf: false,
            bookInWishlist: false 
          }));
        }
      });
    }
  }, [authid, isAuth]);

  useEffect(() => {
    if (bid) {
      if (is.current) setLoading(true);
      
      unsub.bookFetch = bookRef(bid).onSnapshot(snap => {
        if (snap.exists) {
          if (is.current) {
            setBook(snap.data());
            setSeo({
              author: Object.keys(snap.data().authors),
              description: `Scopri su ${app.name} la trama e le recensioni di ${snap.data().title}, scritto da ${Object.keys(snap.data().authors)[0]}, pubblicato da ${snap.data().publisher}`,
              image: snap.data().covers?.[0],
              isbn: snap.data().ISBN_13,
              rating: { scale: '5', value: snap.data().rating_num },
              release_date: snap.data().publication ? new Date(snap.data().publication).toLocaleDateString() : '',
              title: `${snap.data().title} di ${Object.keys(snap.data().authors)[0]} - ${snap.data().publisher} - ${app.name}`,
              url: `${app.url}/book/${snap.data().bid}/${normURL(snap.data().title)}`,
            });
            setUserBook(userBook => ({
              ...userBook,
              bid: snap.data().bid,
              authors: snap.data().authors,
              covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
              genres: snap.data().genres,
              pages_num: snap.data().pages_num,
              publisher: snap.data().publisher,
              title: snap.data().title,
              subtitle: snap.data().subtitle || ''
            }));
          }
        } else console.warn(`No book with bid ${bid}`);
        setLoading(false);
        fetchUserBook(bid || _bid);
      });
    }
  }, [bid, _bid, fetchUserBook]);

  useEffect(() => () => {
    is.current = false;
    unsub.bookFetch && unsub.bookFetch();
    unsub.userBookFetch && unsub.userBookFetch();
  }, []);

  const addBookToShelf = useCallback(bid => {
    if (isAuth) {
      addBookToShelfRef.current.setAttribute('disabled', 'disabled');
      let userWishlist_num = user.stats.wishlist_num;
      const userShelf_num = user.stats.shelf_num + 1;
      const bookReaders_num = book.readers_num + 1;

      if (userBook.bookInWishlist) {
        userWishlist_num -= 1;
      }

      const maxShelfBooks = isPremium || isAdmin ? max.shelfBooks.premium : max.shelfBooks.standard;

      if (userShelf_num > maxShelfBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxShelfBooks} libri`}`, 'error');
      } else {
        userBookRef(authid, bid).set({
          ...userBook,
          added_num: Date.now(),
          bookInShelf: true,
          bookInWishlist: false
        }).then(() => {
          openSnackbar('Libro aggiunto in libreria', 'success');
  
          bookRef(bid).update({
            readers_num: bookReaders_num
          }).then(() => {
            // console.log(`Readers number increased to ${book.readers_num}`);
            
            userRef(authid).update({
              'stats.shelf_num': user.stats.shelf_num + 1,
              'stats.wishlist_num': userWishlist_num
            }).then(() => {
              // console.log('User shelf number increased');
              addBookToShelfRef.current && addBookToShelfRef.current.removeAttribute('disabled');
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }      
    } else console.warn(`Cannot addBookToShelf. User not authenticated`);
  }, [authid, book, isAdmin, isAuth, isPremium, openSnackbar, user, userBook]);
  
  const addBookToWishlist = useCallback(bid => {
    if (isAuth) {
      addBookToWishlistRef.current.setAttribute('disabled', 'disabled');
      const userWishlist_num = user.stats.wishlist_num + 1;
      const maxWishlistBooks = isPremium || isAdmin ? max.wishlistBooks.premium : max.wishlistBooks.standard;

      if (userWishlist_num > maxWishlistBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxWishlistBooks} libri`}`, 'error');
      } else {
        userBookRef(authid, bid).set({
          ...userBook,
          added_num: Date.now(),
          bookInShelf: false,
          bookInWishlist: true
        }).then(() => {
          // console.log('Book added to user wishlist');
          addBookToWishlistRef.current && addBookToWishlistRef.current.removeAttribute('disabled');
          openSnackbar('Libro aggiunto in lista desideri', 'success');
          userRef(authid).update({
            'stats.wishlist_num': userWishlist_num,
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    } else console.warn(`Cannot addBookToWishlist. User not authenticated`);
  }, [authid, isAdmin, isAuth, isPremium, openSnackbar, user, userBook]);
  
  const removeBookFromUserBooks = useCallback((bid, bookshelf) => {
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
        if (is.current) {
          setUserBook(userBook => ({ 
            ...userBook, 
            bookInShelf: false, 
            bookInWishlist: false,
            rating_num: userBookRating_num,
            readingState: { state_num: 1 },
            review
          }));
        }
        // console.log(`Book removed from user ${bookshelf}`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  
      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        readers_num: bookReaders_num
      }).then(() => {
        if (is.current) {
          setBook(book => ({ 
            ...book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num,
            readers_num: bookReaders_num,
            review,
            reviews_num: bookReviews_num
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
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

        if (userBook.review.created_num) {
          reviewerRef(bid, authid).delete().then(() => {
            if (is.current) {
              setUserBook(userBook => ({ 
                ...userBook, 
                review
              }));
            }
            // console.log(`Review removed from book`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }

        if (book.collections) {
          book.collections.forEach(cid => {
            collectionBookRef(cid, book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
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
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn(`no bookshelf named "${bookshelf}"`);
    } else console.warn(`Cannot removeBookFromUserBooks. User not authenticated`);
  }, [authid, book, isAuth, openSnackbar, user, userBook]);

  const removeBookFromShelf = useCallback(bid => removeBookFromUserBooks(bid, 'shelf'), [removeBookFromUserBooks]);

  const removeBookFromWishlist = useCallback(bid => removeBookFromUserBooks(bid, 'wishlist'), [removeBookFromUserBooks]);

	const rateBook = useCallback((bid, rate) => {
    if (isAuth) {
      let bookRating_num = book.rating_num;
      const userBookRating_num = userBook.rating_num;
      let bookRatings_num = book.ratings_num; 
      let userRatings_num = user.stats.ratings_num;

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
        if (is.current) {
          setBook(book => ({ 
            ...book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num
          }));
        }
        // console.log(`Book rated with ${rate} stars`);

        if (book.collections) {
          book.collections.forEach(cid => {
            // console.log(cid);
            collectionBookRef(cid, book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
          });
        };
  
        userBookRef(authid, bid).update({
          rating_num: rate
        }).then(() => {
          if (is.current) {
            setUserBook(userBook => ({ 
              ...userBook, 
              rating_num: rate
            }));
          }
          // console.log('User book rated with ' + rate + ' stars');
          userRef(authid).update({
            'stats.ratings_num': userRatings_num
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn(`Cannot rateBook. User not authenticated`);
  }, [authid, book, isAuth, openSnackbar, user, userBook]);
  
  const addReview = useCallback(() => {
    if (is.current) {
      setBook(book => ({ ...book, reviews_num: book.reviews_num + 1 }));
    }
  }, []);

  const removeReview = useCallback(() => {
    if (is.current) {
      setBook(book => ({ ...book, reviews_num: book.reviews_num - 1 }));
    }
  }, []);

  const onEditing = useCallback(() => {
    if (book.EDIT.edit || user.roles.admin) {
      if (is.current) {
        setIsEditing(isEditing => (!isEditing));
      }
    } else console.warn('Cannot edit book. Book locked');
  }, [book, user]);

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
          onEditing={onEditing}
          book={book}
        />
      ) : (
        <BookProfile 
          addBookToShelf={addBookToShelf} 
          addBookToShelfRef={addBookToShelfRef} 
          addBookToWishlist={addBookToWishlist} 
          addBookToWishlistRef={addBookToWishlistRef} 
          addReview={addReview}
          history={history}
          location={location}
          removeBookFromShelf={removeBookFromShelf} 
          removeBookFromWishlist={removeBookFromWishlist} 
          removeReview={removeReview}
          rateBook={rateBook}
          onEditing={onEditing}
          loading={loading}
          book={book}
          userBook={userBook}
        />
      )}
    </>
  );
}

Book.propTypes = {
  bid: stringType,
  book: bookType,
  history: objectType.isRequired,
  isEditing: boolType,
  location: objectType.isRequired,
  // userBook: userBookType
}

Book.defaultProps = {
  bid: null,
  book: null,
  isEditing: false,
  // userBook: null
}
 
export default Book;