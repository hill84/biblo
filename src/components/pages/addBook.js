import React from 'react';
import { Link } from 'react-router-dom';
import { userType } from '../../config/types';
import SearchBookForm from '../forms/searchBookForm';
import Book from '../book';

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
			<div className="container" ref="AddBookComponent">
				<h2>Aggiungi un libro</h2>
				<div className="card">
					<SearchBookForm onBookSelect={this.onBookSelect} />
				</div>
				{book ?
					<Book book={book} user={this.props.user} />
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

AddBook.propTypes = {
	user: userType
}