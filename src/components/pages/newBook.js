import React from 'react';
import { userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

export default class NewBook extends React.Component {
	state = {
		book: null
	}

	static propTypes = {
		user: userType
	}

	onBookSelect = book => this.setState({ book });
	
	render() {
		const { book } = this.state;
		const { user } = this.props;

		return (
			<div className="container" ref="NewBookComponent">
				<h2>Crea la tua scheda libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} user={user} new={true} />
				</div>
				{book && <Book book={book} user={user} isEditing={true} />}
			</div>
		);
	}
}