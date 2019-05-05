import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { icon } from '../../config/icons';
import { primaryTheme } from '../../config/themes';
import { funcType, userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';
import { app } from '../../config/shared';
import { Helmet } from 'react-helmet';

const seo = {
  title: `${app.name} | Aggiungi libro`,
  description: app.desc
}

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
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
        </Helmet>
        {!book && <h2 className="text-center">{icon.magnify()} Cerca un libro</h2>}
        <ThemeProvider theme={primaryTheme}>
          <div className="card sm primary search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} />
          </div>
        </ThemeProvider>
				{book ?
					<Book bid={book.bid} book={book} user={user} openSnackbar={openSnackbar} />
        :
          <React.Fragment>
            <p className="text-center">
              <Link to="/genres" className="counter">Generi</Link>
              <Link to="/collections" className="counter">Collezioni</Link>
              <Link to="/authors" className="counter">Autori</Link>
            </p>
            <div className="text-center pad-v fadeIn reveal" style={{animationDelay: '2s'}}>
              <p>Non hai trovato il libro che cercavi?</p>
              <p><Link to="/new-book" className="btn primary rounded">Crea la tua scheda libro</Link></p>
            </div>
          </React.Fragment>
				}
			</div>
		);
	}
}