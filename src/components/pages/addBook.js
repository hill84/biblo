import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import icon from '../../config/icons';
import { app } from '../../config/shared';
import { primaryTheme } from '../../config/themes';
import { locationType, historyType, funcType, userType } from '../../config/types';
import Book from '../book';
import SearchBookForm from '../forms/searchBookForm';

const seo = {
  title: `${app.name} | Aggiungi libro`,
  description: app.desc
}

export default class AddBook extends React.Component {
	state = {
		book: null
	}

	static propTypes = {
    history: historyType,
    location: locationType,
    openSnackbar: funcType,
		user: userType
  }

  static defaultProps = {
    history: null,
    location: null,
    openSnackbar: null,
    user: null
  }
  
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

	onBookSelect = book => this._isMounted && this.setState({ book });
	
	render() {
    const { book } = this.state;
    const { history, location, openSnackbar, user } = this.props;

		return (
			<div className="container" id="addBookComponent">
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <link rel="canonical" href={app.url} />
        </Helmet>
        {!book && <h2 className="text-center">{icon.magnify()} Cerca un libro</h2>}
        <ThemeProvider theme={primaryTheme}>
          <div className="card sm primary search-book">
            <SearchBookForm onBookSelect={this.onBookSelect} user={user} />
          </div>
        </ThemeProvider>
				{book ?
					<Book bid={book.bid} book={book} history={history} location={location} user={user} openSnackbar={openSnackbar} />
        :
          <>
            <p className="text-center">
              <Link to="/genres" className="counter">Generi</Link>
              <Link to="/collections" className="counter">Collezioni</Link>
              <Link to="/authors" className="counter">Autori</Link>
            </p>
            <div className="text-center pad-v fadeIn reveal" style={{ animationDelay: '2s', }}>
              <p>Non hai trovato il libro che cercavi?</p>
              <p><Link to="/new-book" className="btn primary rounded">Crea la tua scheda libro</Link></p>
            </div>
          </>
				}
			</div>
		);
	}
}