import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { icon } from '../../config/icons';
import { darkTheme } from '../../config/themes';
import { funcType, userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

export default class NewBook extends React.Component {
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
			<div className="container" id="newBookComponent">
        {!book && <h2 className="text-center">{icon.plus()} Crea la tua scheda libro</h2>}
        <MuiThemeProvider theme={darkTheme}>
          <div className="card sm dark search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} newBook />
          </div>
        </MuiThemeProvider>
				{book ? <Book book={book} user={user} openSnackbar={openSnackbar} isEditing />
        : <p className="text-sm lighter-text text-center">Powered by <a href="https://books.google.com/">Google Books</a></p>}
			</div>
		);
	}
}