import React from 'react';
import { bookType, stringType } from '../../config/types';
import { bookRef, userBookRef, userRef } from '../../config/firebase';
import BookForm from '../forms/bookForm';
import BookProfile from './bookProfile';

export default class Book extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: {
        bid: this.props.book.bid || '', 
        ISBN_num: this.props.book.ISBN_num || 0, 
        title: this.props.book.title || '', 
        title_sort: this.props.book.title_sort || '', 
        subtitle: this.props.book.subtitle || '', 
        authors: this.props.book.authors || '', 
        format: this.props.book.format || '', 
        covers: this.props.book.covers || [], 
        pages_num: this.props.book.pages_num || 0, 
        publisher: this.props.book.publisher || '', 
        publication: this.props.book.publication || '', 
        edition_num: this.props.book.edition || 0, 
        genres: this.props.book.genres || [], 
        languages: this.props.book.languages, 
        description: this.props.book.description || '', 
        incipit: this.props.book.incipit || '',
        readers_num: this.props.book.readers_num || 0,
        ratings_num: this.props.book.ratings_num || 0,
        rating_num: this.props.book.rating_num || 0,
        reviews_num: this.props.book.reviews_num || 0
      },
      ratings_num: this.props.book.ratings_num || 0,
      rating_num: this.props.book.rating_num || 0,
      readers_num: this.props.book.readers_num || 0,
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
      userBookRef(this.props.uid, bid).delete().then(() => {
        this.setState({ 
          userBook: { ...this.state.userBook, bookInShelf: false, bookInWishlist: false }
        });
        console.log(`Book removed from user ${collection}`);
      }).catch(error => console.log(error));

      bookRef(bid).update({
        rating_num: this.state.rating_num,
        ratings_num : this.state.ratings_num,
        readers_num: this.state.readers_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book, 
            rating_num: this.state.rating_num, 
            ratings_num: this.state.ratings_num,
            readers_num: this.state.readers_num
          },
          userBook: { ...this.state.userBook, rating_num: 0 }
        });
        console.log('Rating and reader removed');
      }).catch(error => console.log(error));

      if (collection === 'shelf') {
        console.log('will remove book and rating from user shelf stats');
        userRef(this.props.uid).set({
          ...this.props.user,
          'stats.shelf_num': this.props.user.stats.shelf_num,
          'stats.ratings_num': this.props.user.stats.ratings_num - 1
        }).then(() => {
          console.log('Book and rating removed from user shelf stats');
        }).catch(error => console.log(error));
      } else if (collection === 'wishlist') {
        console.log('will remove book from user wishlist stats');
        userRef(this.props.uid).set({
          ...this.props.user,
          stats: {
            ...this.props.user.stats, 
            wishlist_num: this.props.user.stats.wishlist_num
          }
        }).then(() => {
          console.log('Book removed from user wishlist stats');
        }).catch(error => console.log(error));
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book
      });
    }
  }

  componentDidMount(props) {
    if (this.props.uid && this.props.book.bid) {
      userBookRef(this.props.uid, this.props.book.bid).onSnapshot(snap => {
        if (snap.exists) {
          this.setState({
            userBook: snap.data()
          });
        } 
      });
    }
    /* if (!this.props.book && this.props.match) {
      const matchBid = this.props.match.params.book;
      booksRef.where('bid', '==', matchBid).limit(1).onSnapshot(snap => {
        if (snap.exists) {
          this.setState({
            book: {
              ...this.state.book,
              ...snap.data()
            }
          });
        } else {
          console.log('No book named ' + this.props.match.params.book);
        }
      });
    } */
  }
  
  addBookToShelf = bid => {
    userBookRef(this.props.uid, bid).set({
      ...this.state.userBook,
      bookInShelf: true,
      bookInWishlist: false
    }).then(() => {
      this.setState({ 
        userBook: { ...this.state.userBook, bookInShelf: true, bookInWishlist: false }
      });
      console.log('Book added to user shelf');
    }).catch(error => console.log(error));

    bookRef(bid).set({
      ...this.state.book,
      readers_num: this.state.readers_num + 1
    }).then(() => {
      this.setState({ 
        book: { ...this.state.book, readers_num: this.state.readers_num + 1 }
      });
      console.log('Readers number increased');
    }).catch(error => console.log(error));
	}

	addBookToWishlist = bid => {
    userBookRef(this.props.uid, bid).set({
      ...this.state.userBook,
      bookInShelf: false,
      bookInWishlist: true
    }).then(() => {
      this.setState({ 
        userBook: { ...this.state.userBook, bookInShelf: false, bookInWishlist: true }
      });
      console.log('Book added to user wishlist');
    }).catch(error => console.log(error));
	}

	removeBookFromShelf = bid => {
		this.removeBookFromUserBooks(bid, 'shelf');
	}

	removeBookFromWishlist = bid => {
		this.removeBookFromUserBooks(bid, 'wishlist');
  }

	rateBook = (bid, rate) => {
    userBookRef(this.props.uid, bid).set({
      ...this.state.userBook,
      rating_num: rate
    }).then(() => {
      this.setState({ 
        userBook: { ...this.state.userBook, rating_num: rate }
      });
      console.log('Book rated with ' + rate + ' stars');
    }).catch(error => console.log(error));

    var bookRatings = this.state.ratings_num;
    var userRatings = this.props.user.stats.ratings_num;
    if (this.state.rating_num === 0) {
      bookRatings += 1;
      userRatings += 1;
    }

    bookRef(bid).set({
      ...this.state.book,
      rating_num: this.state.rating_num + rate,
      ratings_num: bookRatings
    }).then(() => {
      this.setState({ 
        book: { 
          ...this.state.book, 
          rating_num: this.state.rating_num + rate, 
          ratings_num: bookRatings 
        },
        userBook: { ...this.state.userBook, rating_num: rate }
      });
      console.log('Book rated with ' + rate + ' stars');
    }).catch(error => console.log(error));

    userRef(this.props.uid).update({
      'stats.ratings_num': userRatings
    }).then(() => {
      console.log('User ratings number increased');
    }).catch(error => console.log(error));
	}

	isEditing = () => this.setState(prevState => ({ isEditing: !prevState.isEditing }));
	
	render() {
		const { book, isEditing, userBook } = this.state;

    if (!book || !userBook) return null;

		return (
			<div ref="BookComponent">
        <div>
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
			</div>
		);
	}
}

Book.propTypes = {
  uid: stringType,
  book: bookType
}