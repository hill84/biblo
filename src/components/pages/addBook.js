import React from 'react';
/* import { stringType } from '../../config/types'; */
import SearchBookForm from '../forms/searchBookForm';
import BookForm from '../forms/bookForm';
import BookProfile from './bookProfile';

export default class AddBook extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: null,
			bookInShelf: false,
      bookInWishlist: false,
			isEditing: false
		}
	}

	onBookSelect = book => this.setState({ book });

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
		const { book, bookInShelf, bookInWishlist, isEditing, userBooks } = this.state;

		return (
			<div ref="AddBookComponent">
				<h2>Aggiungi un libro</h2>
				{!isEditing &&
					<div className="card">
						<SearchBookForm onBookSelect={this.onBookSelect} />
					</div>
				}
				{book && 
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
								userBooks={userBooks}
							/>
						}
					</div>
				}
			</div>
		);
	}
}