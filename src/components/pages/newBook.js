import React from 'react';
import SearchBookForm from '../forms/searchBookForm';
import Book from '../pages/book';

export default class NewBook extends React.Component {
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
			<div ref="NewBookComponent">
				<h2>Crea libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} new={true} />
				</div>
				{book && <Book book={book} />}
			</div>
		);
	}
}