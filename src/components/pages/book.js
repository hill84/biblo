import React from 'react';
import { bookType, stringType } from '../../config/types';
import { UserShelfBookRef } from '../../config/firebase';
import BookForm from '../forms/bookForm';
import BookProfile from './bookProfile';

export default class Book extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: this.props.book,
			bookInShelf: false,
      bookInWishlist: false,
      userBook: null,
			isEditing: false
		}
  }

  componentWillReceiveProps(nextProps, props) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book,
        userBook: null,
        bookInShelf: false,
        bookInWishlist: false
      });

      UserShelfBookRef(nextProps.uid, nextProps.book.bid).onSnapshot(snap => {
        if (snap.exists) {
          this.setState({
            userBook: snap.data(),
            bookInShelf: snap.data().shelf,
            bookInWishlist: snap.data().wishlist
          });
        } else {
          this.setState({
            userBook: null,
            bookInShelf: false,
            bookInWishlist: false
          });
        }
      });
    }
  }

  componentDidMount(props) {
    UserShelfBookRef(this.props.uid, this.props.book.bid).onSnapshot(snap => {
      if (snap.exists) {
        this.setState({
          userBook: snap.data(),
          bookInShelf: snap.data().shelf,
          bookInWishlist: snap.data().wishlist
        });
      } else {
        this.setState({
          userBook: null,
          bookInShelf: false,
          bookInWishlist: false
        });
      }
    });
  }
  
  addBookToShelf = bid => {
		console.log('Book added to user shelf ' + bid);
		this.setState({ 
			bookInShelf: true,
			bookInWishlist: false
		});
	}

	addBookToWishlist = bid => {
		console.log('Book added to user wishlist ' + bid);
		this.setState({ 
			bookInShelf: false,
			bookInWishlist: true
		});
	}

	removeBookFromShelf = bid => {
		console.log('Book removed from user shelf ' + bid);
		this.setState({ 
			bookInShelf: false
		});
	}

	removeBookFromWishlist = bid => {
		console.log('Book removed from user wishlist ' + bid);
		this.setState({ 
			bookInWishlist: false
		});
	}

	rateBook = (bid, rate) => {
		console.log('Book rated with ' + rate + ' stars');
	}

	isEditing = () => this.setState(prevState => ({ isEditing: !prevState.isEditing }));
	
	render() {
		const { book, bookInShelf, bookInWishlist, isEditing, userBook } = this.state;

    if (!book) return null;

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
              bookInShelf={bookInShelf}
              bookInWishlist={bookInWishlist}
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