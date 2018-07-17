import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { primaryTheme } from '../../config/themes';
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
			<div className="container" id="addBookComponent">
        {/* <h2>Aggiungi un libro</h2> */}
        <MuiThemeProvider theme={primaryTheme}>
          <div className="card sm primary" id="search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} />
          </div>
        </MuiThemeProvider>
				{book ?
					<Book book={book} user={user} />
				:
					<div className="text-center">
						<div>&nbsp;</div>
						<p>Non hai trovato il libro che cercavi?</p>
						<p><Link to="/new-book" className="btn primary">Crea la tua scheda libro</Link></p>
					</div>
				}
				
			</div>
		);
	}
}