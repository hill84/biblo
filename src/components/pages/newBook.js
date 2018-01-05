import React from 'react';
import SearchBookForm from '../forms/searchBookForm';
import BookForm from '../forms/bookForm';

export default class NewBook extends React.Component {
	constructor() {
		super();
		this.state = {
			book: null
		}
	}

	onBookSelect = book => this.setState({ book });

	addBook = () => console.log('hi');
	
	render() {
		return (
			<div id="NewBookComponent">
				<h2>Aggiungi un libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} />
					{this.state.book && <BookForm submit={this.addBook} book={this.state.book} />}
				</div>
			</div>
		);
	}
}