import React from 'react';
import SearchBookForm from '../forms/searchBookForm';
import BookForm from '../forms/bookForm';
import BookProfile from './bookProfile';

export default class AddBook extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: null,
			isEditing: false
		}
	}

	onBookSelect = book => this.setState({ book });

	addBookToShelf = bid => console.log('Book added to user shelf ' + bid);

	addBookToWishlist = bid => console.log('Book added to user wishlist ' + bid);

	removeBookFromShelf = bid => console.log('Book removed from user shelf ' + bid);

	removeBookFromWishlist = bid => console.log('Book removed from user wishlist ' + bid);

	isEditing = () => this.setState(prevState => ({ isEditing: !prevState.isEditing }));
	
	render() {
		const { book, isEditing } = this.state;

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
								isEditing={this.isEditing}
								book={book} 
							/>
						}
					</div>
				}
			</div>
		);
	}
}