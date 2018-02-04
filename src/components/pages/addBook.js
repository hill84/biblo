import React from 'react';
import { stringType } from '../../config/types';
import SearchBookForm from '../forms/searchBookForm';
import Book from '../pages/book';

export default class AddBook extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			book: null
		}
	}

	onBookSelect = book => this.setState({ book });
	
	render() {
		const { book } = this.state;

		return (
			<div ref="AddBookComponent">
				<h2>Aggiungi un libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} />
				</div>
				{book && <Book book={book} uid={this.props.uid} />}
			</div>
		);
	}
}

AddBook.propTypes = {
  uid: stringType
}