import React from 'react';
import { userType } from '../../config/types';
import SearchBookForm from '../forms/searchBookForm';
import Book from '../book';

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
			<div className="container" ref="NewBookComponent">
				<h2>Crea la tua scheda libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} new={true} />
				</div>
				{book && <Book book={book} user={this.props.user} />}
			</div>
		);
	}
}

NewBook.propTypes = {
	user: userType
}