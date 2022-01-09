import { DocumentData, FirestoreError } from '@firebase/firestore-types';
import React, { CSSProperties, FC, Fragment, lazy, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RouteComponentProps } from 'react-router-dom';
import { bookRef, collectionBookRef, reviewerRef, userBookRef, userRef } from '../config/firebase';
import { app, handleFirestoreError, normURL } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import { BookModel, BookshelfType, UserBookModel } from '../types';
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

interface BookProps extends Pick<RouteComponentProps, 'location' | 'history'> {
  bid?: string;
  book?: BookModel | null;
  isEditing?: boolean;
  // userBook?: UserBookModel;
}

export const initialUserBook: UserBookModel = {
  added_num: 0,
  authors: {},
  bid: '',
  bookInShelf: false,
  bookInWishlist: false,
  covers: [],
  genres: [],
  pages_num: 0,
  publisher: '',
  rating_num: 0,
  readingState: { state_num: 1 },
  review: {},
  subtitle: '',
  title: '',
};

interface SeoModel {
  author: string;
  description: string;
  image: string;
  isbn: string;
  rating: { scale: string; value: string };
  release_date: string;
  title: string;
  url: string;
}

let fetchUserBookCanceler: null | (() => void) = null;
let fetchBookCanceler: null | (() => void) = null;

const Book: FC<BookProps> = ({
  bid,
  book: _book = null,
  history,
  isEditing: _isEditing = false,
  location
}: BookProps) => {
  const { isAdmin, isAuth, isPremium, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [book, setBook] = useState<BookModel | null>(_book);
  const [isEditing, setIsEditing] = useState<boolean>(_isEditing);
  const [loading, setLoading] = useState<boolean>(!_book);
  const [userBook, setUserBook] = useState<UserBookModel>(initialUserBook);
  const [seo, setSeo] = useState<SeoModel | null>(_book && {
    author: Object.keys(_book.authors)?.[0],
    description: `Scopri su ${app.name} la trama e le recensioni di ${_book.title}, scritto da ${Object.keys(_book.authors)[0]}, pubblicato da ${_book.publisher}`,
    image: _book.covers?.[0],
    isbn: String(_book.ISBN_13),
    rating: { scale: '5', value: String(_book.rating_num || 0) },
    release_date: _book.publication ? new Date(_book.publication).toLocaleDateString() : '',
    title: `${_book.title} di ${Object.keys(_book.authors)[0]} - ${_book.publisher} - ${app.name}`,
    url: `${app.url}/book/${_book.bid}/${normURL(_book.title)}`,
  });
  const addBookToShelfRef = useRef<HTMLButtonElement>(null);
  const addBookToWishlistRef = useRef<HTMLButtonElement>(null);

  const authid: string = user?.uid || '';
  const _bid: string = book?.bid || '';

  const fetchUserBook = useCallback((bid: string): void => {
    if (authid && isAuth && bid) {
      fetchUserBookCanceler = userBookRef(authid, bid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setUserBook(snap.data());
        } else {
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
      setLoading(true);
      fetchBookCanceler = bookRef(bid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setBook(snap.data());
          setSeo({
            author: Object.keys(snap.data().authors)?.[0],
            description: `Scopri su ${app.name} la trama e le recensioni di ${snap.data().title}, scritto da ${Object.keys(snap.data().authors)[0]}, pubblicato da ${snap.data().publisher}`,
            image: snap.data().covers?.[0],
            isbn: snap.data().ISBN_13,
            rating: { scale: '5', value: String(snap.data().rating_num || 0) },
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
        } else console.warn(`No book with bid ${bid}`);
        setLoading(false);
        fetchUserBook(bid || _bid);
      }, (err: FirestoreError): void => {
        openSnackbar(handleFirestoreError(err), 'error');
      });
    }
  }, [authid, bid, _bid, fetchUserBook, openSnackbar]);

  useEffect(() => () => {
    fetchUserBookCanceler?.();
    fetchBookCanceler?.();
  }, []);

  const addBookToShelf = useCallback((bid: string): void => {
    if (isAuth && user && book) {
      addBookToShelfRef.current?.setAttribute('disabled', 'disabled');
      let userWishlist_num: number = user.stats.wishlist_num;
      const userShelf_num: number = user.stats.shelf_num + 1;
      const bookReaders_num: number = book.readers_num + 1;

      if (userBook.bookInWishlist) {
        userWishlist_num -= 1;
      }

      const maxShelfBooks: number = isPremium || isAdmin ? max.shelfBooks.premium : max.shelfBooks.standard;

      if (userShelf_num > maxShelfBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxShelfBooks} libri`}`, 'error');
      } else {
        userBookRef(authid, bid).set({
          ...userBook,
          added_num: Date.now(),
          bookInShelf: true,
          bookInWishlist: false
        }).then((): void => {
          openSnackbar('Libro aggiunto in libreria', 'success');
  
          bookRef(bid).update({
            readers_num: bookReaders_num
          }).then((): void => {
            // console.log(`Readers number increased to ${book.readers_num}`);
            
            userRef(authid).update({
              'stats.shelf_num': user.stats.shelf_num + 1,
              'stats.wishlist_num': userWishlist_num
            }).then((): void => {
              // console.log('User shelf number increased');
              addBookToShelfRef.current && addBookToShelfRef.current.removeAttribute('disabled');
            }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
          }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }      
    } else console.warn('Cannot addBookToShelf. User not authenticated');
  }, [authid, book, isAdmin, isAuth, isPremium, openSnackbar, user, userBook]);
  
  const addBookToWishlist = useCallback((bid: string): void => {
    if (isAuth && user) {
      addBookToWishlistRef.current?.setAttribute('disabled', 'disabled');
      const userWishlist_num: number = user.stats.wishlist_num + 1;
      const maxWishlistBooks: number = isPremium || isAdmin ? max.wishlistBooks.premium : max.wishlistBooks.standard;

      if (userWishlist_num > maxWishlistBooks) {
        openSnackbar(`Limite massimo superato${(isAdmin || isPremium) ? '' : `. Passa al livello premium per aggiungere più di ${maxWishlistBooks} libri`}`, 'error');
      } else {
        userBookRef(authid, bid).set({
          ...userBook,
          added_num: Date.now(),
          bookInShelf: false,
          bookInWishlist: true
        }).then((): void => {
          // console.log('Book added to user wishlist');
          addBookToWishlistRef.current && addBookToWishlistRef.current.removeAttribute('disabled');
          openSnackbar('Libro aggiunto in lista desideri', 'success');
          userRef(authid).update({
            'stats.wishlist_num': userWishlist_num,
          }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }
    } else console.warn('Cannot addBookToWishlist. User not authenticated');
  }, [authid, isAdmin, isAuth, isPremium, openSnackbar, user, userBook]);
  
  const removeBookFromUserBooks = useCallback((bid: string, bookshelf: BookshelfType): void => {
    if (isAuth && user && book) {
      let userShelf_num: number = user.stats.shelf_num;
      let userWishlist_num: number = user.stats.wishlist_num;
      let bookRating_num: number = book.rating_num;
      let bookRatings_num: number = book.ratings_num;
      let bookReaders_num: number = book.readers_num;
      let bookReviews_num: number = book.reviews_num;
      let userRatings_num: number = user.stats.ratings_num;
      let userBookRating_num: number = userBook.rating_num;
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
      
      userBookRef(authid, bid).delete().then((): void => {
        setUserBook(userBook => ({ 
          ...userBook,
          bookInShelf: false, 
          bookInWishlist: false,
          rating_num: userBookRating_num,
          readingState: { state_num: 1 },
          review
        }));
        // console.log(`Book removed from user ${bookshelf}`);
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  
      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        readers_num: bookReaders_num
      }).then(() => {
        setBook(book => ({ 
          ...book, 
          rating_num: bookRating_num, 
          ratings_num: bookRatings_num,
          readers_num: bookReaders_num,
          review,
          reviews_num: bookReviews_num
        } as BookModel));
        // console.log('Rating and reader removed');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  
      if (bookshelf === 'shelf') {
        // console.log('will remove book and rating from user shelf stats');
        userRef(authid).update({
          ...user,
          stats: {
            ...user.stats,
            shelf_num: userShelf_num,
            ratings_num: userRatings_num
          }
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));

        if (userBook.review.created_num) {
          reviewerRef(bid, authid).delete().then((): void => {
            setUserBook(userBook => ({ 
              ...userBook,
              review
            }));
            // console.log(`Review removed from book`);
          }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        }

        if (book.collections) {
          book.collections.forEach((cid: string): void => {
            collectionBookRef(cid, book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
          });
        }
      } else if (bookshelf === 'wishlist') {
        // console.log('will remove book from user wishlist stats');
        userRef(authid).update({
          ...user,
          stats: {
            ...user.stats,
            wishlist_num: userWishlist_num
          }
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn(`no bookshelf named '${bookshelf}'`);
    } else console.warn('Cannot removeBookFromUserBooks. User not authenticated');
  }, [authid, book, isAuth, openSnackbar, user, userBook]);

  const removeBookFromShelf = useCallback((bid: string): void => removeBookFromUserBooks(bid, 'shelf'), [removeBookFromUserBooks]);

  const removeBookFromWishlist = useCallback((bid: string): void => removeBookFromUserBooks(bid, 'wishlist'), [removeBookFromUserBooks]);

  const rateBook = useCallback((bid: string, rate): void => {
    if (isAuth && user && book) {
      let bookRating_num: number = book.rating_num;
      const userBookRating_num: number = userBook.rating_num;
      let bookRatings_num: number = book.ratings_num; 
      let userRatings_num: number = user.stats.ratings_num;

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
      }).then((): void => {
        setBook(book => ({ 
          ...book, 
          rating_num: bookRating_num, 
          ratings_num: bookRatings_num
        } as BookModel));
        // console.log(`Book rated with ${rate} stars`);

        if (book.collections) {
          book.collections.forEach((cid: string): void => {
            // console.log(cid);
            collectionBookRef(cid, book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
          });
        }
  
        userBookRef(authid, bid).update({
          rating_num: rate
        }).then((): void => {
          setUserBook(userBook => ({ 
            ...userBook,
            rating_num: rate
          }));
          // console.log('User book rated with ' + rate + ' stars');
          userRef(authid).update({
            'stats.ratings_num': userRatings_num
          }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn('Cannot rateBook. User not authenticated');
  }, [authid, book, isAuth, openSnackbar, user, userBook]);
  
  // const addReview = useCallback((): void => {
  //   setBook(book => ({ ...book, reviews_num: book ? book.reviews_num + 1 : 0 } as BookModel));
  // }, []);

  // const removeReview = useCallback((): void => {
  //   setBook(book => ({ ...book, reviews_num: book ? book.reviews_num - 1 : 0 } as BookModel));
  // }, []);

  const onEditing = useCallback((): void => {
    if (book?.EDIT.edit || user?.roles.admin) {
      setIsEditing(isEditing => !isEditing);
    } else console.warn('Cannot edit book. Book locked');
  }, [book, user]);

  if (!loading && !book) return (
    <NoMatch title='Libro non trovato' history={history} location={location} />
  );

  const bgStyle: CSSProperties | undefined = book ? { backgroundImage: `url(${book.covers[0]})`, } : undefined;

  return (
    <Fragment>
      {seo && (
        <Helmet>
          <title>{app.name} | {book?.title || 'Libro'}</title>
          <link rel='canonical' href={`${app.url}/genres`} />
          <meta name='description' content={seo.description} />
          <meta property='og:description' content={seo.description} />
          <meta property='og:type' content='books.book' />
          <meta property='og:url' content={seo.url} />
          <meta property='og:title' content={seo.title} />
          {seo.image && <meta property='og:image' content={seo.image} />}
          <meta property='book:author' content={seo.author?.[0]} />
          <meta property='book:isbn' content={seo.isbn} />
          <meta property='book:release_date' content={seo.release_date} />
          <meta property='books:rating:value' content={seo.rating.value} />
          <meta property='books:rating:scale' content={seo.rating.scale} />
        </Helmet>
      )}
      
      <div className='content-background reveal fadeIn delay4'>
        <div className='bg' style={bgStyle} />
      </div>
      {isEditing && isAuth && book ? (
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
          // addReview={addReview}
          history={history}
          location={location}
          removeBookFromShelf={removeBookFromShelf} 
          removeBookFromWishlist={removeBookFromWishlist} 
          // removeReview={removeReview}
          rateBook={rateBook}
          onEditing={onEditing}
          loading={loading}
          book={book || undefined}
          userBook={userBook}
        />
      )}
    </Fragment>
  );
};
 
export default Book;