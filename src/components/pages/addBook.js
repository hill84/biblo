import React from 'react';
import Link from 'react-router-dom/Link';
import { userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

export default class AddBook extends React.Component {
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
			<div className="container" ref="AddBookComponent">
				<h2>Aggiungi un libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} user={user} />
				</div>
				{book ?
					<Book book={book} user={user} />
				:
					<div className="text-align-center">
						<div>&nbsp;</div>
						<p>Non hai trovato il libro che cercavi?</p>
						<p><Link to="/new-book" className="btn primary">Crea la tua scheda libro</Link></p>
					</div>
				}
				
			</div>
		);
	}
}