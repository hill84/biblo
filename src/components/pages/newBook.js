import { MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { primaryTheme } from '../../config/themes';
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
        {/* <h2>Crea la tua scheda libro</h2> */}
        <MuiThemeProvider theme={primaryTheme}>
          <div className="card sm primary" id="search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} new={true} />
          </div>
        </MuiThemeProvider>
				{book && <Book book={book} user={user} openSnackbar={openSnackbar} isEditing={true} />}
			</div>
		);
	}
}