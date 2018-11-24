import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { primaryTheme } from '../../config/themes';
import { funcType, userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

export default class AddBook extends React.Component {
	state = {
		book: null
	}

	static propTypes = {
    openSnackbar: funcType,
		user: userType
	}

	onBookSelect = book => this.setState({ book });
	
	render() {
    const { book } = this.state;
    const { openSnackbar, user } = this.props;

		return (
			<div className="container" id="addBookComponent">
        {/* <h2>Aggiungi un libro</h2> */}
        <MuiThemeProvider theme={primaryTheme}>
          <div className="card sm primary search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} />
          </div>
        </MuiThemeProvider>
				{book ?
					<Book bid={book.bid} book={book} user={user} openSnackbar={openSnackbar} />
				:
					<div className="text-center pad-v fadeIn reveal" style={{animationDelay: '2s'}}>
						<p>Non hai trovato il libro che cercavi?</p>
						<p><Link to="/new-book" className="btn primary">Crea la tua scheda libro</Link></p>
					</div>
				}
			</div>
		);
	}
}