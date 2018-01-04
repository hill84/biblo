import React from 'react';
import SearchBookForm from '../forms/searchBookForm';

export default class NewBook extends React.Component {
	constructor() {
		super();
		this.state = {
			book: null
		}
	}
	
	render() {
		return (
			<div id="NewBookComponent">
				<h2>Aggiungi un libro</h2>
				<div className="card">
					<SearchBookForm />
				</div>
			</div>
		);
	}
}