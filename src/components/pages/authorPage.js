import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { authorRef, booksRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { app, denormURL, getInitials, normalizeString, normURL } from '../../config/shared';
import Cover from '../cover';
import NoMatch from '../noMatch';
import MinifiableText from '../minifiableText';
import RandomQuote from '../randomQuote';
import { Helmet } from 'react-helmet';

export default class AuthorPage extends React.Component {
  state = {
    author: {
      bio: '',
      displayName: denormURL(this.props.match.params.aid) || '',
      edit: null,
      followers: {},
      languages: [],
      lastEditBy: '',
      lastEditByUid: '',
      lastEdit_num: 0,
      photoURL: '',
      sex: '',
      source: ''
    },
    books: null,
    coverview: true,
    loading: true,
    loadingBooks: true
  }

  componentDidMount() {
    this._isMounted = true;
    const { author } = this.state;
    
		authorRef(normalizeString(author.displayName)).get().then(snap => {
			if (snap.exists) {
        if (this._isMounted) {
          this.setState({ author: snap.data(), loading: false });
        }
			} else {
        if (this._isMounted) {
          this.setState({ loading: false });
        }
			}
    }).catch(error => console.warn(error));

    booksRef.where(`authors.${author.displayName}`, '==', true).get().then(snap => {
      if (!snap.empty) {
        const books = [];
        snap.forEach(book => books.push(book.data()));
        // console.log(books);
        if (this._isMounted) {
          this.setState({ books, loadingBooks: false });
        }
      } else {
        if (this._isMounted) {
          this.setState({ books: null, loadingBooks: false });
        }
      }
		}).catch(error => console.warn(error));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview }));

  render() {
    const { author, books, coverview, loading, loadingBooks } = this.state;
    const { history, location } = this.props;

    const covers = books && books.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}><Cover book={book} /></Link>);

    if (loading) {
      return <div aria-hidden="true" className="loader"><CircularProgress /></div>
    } 
    if (!author.lastEditByUid && !books) {
      return <NoMatch title="Autore non trovato" history={history} location={location} />
    }

    const seo = author && author.displayName && {
      description: `Scopri su ${app.name} i libri di ${author.displayName}`,
      image: author.photoURL,
      title: `${app.name} | ${author.displayName}`,
      url: `${app.url}/author/${normURL(author.displayName)}`,
    };

    return (
      <div className="container" id="authorComponent">
        <Helmet>
          <title>{seo.title || `${app.name} | Autore`}</title>
          <link rel="canonical" href={`${app.url}/authors`} />
          <meta name="description" content={seo.description} />
          <meta property="og:type" content="books.author" />
          <meta property="og:title" content={seo.title} />
          <meta property="og:url" content={seo.url} />
          <meta property="og:description" content={seo.description} />
          {seo.image && <meta property="og:image" content={seo.image} />}
        </Helmet>
        <div className="card dark" id="authorCard">
          <div className="row text-center-md">
            <div className="col-md-auto col-sm-12">
              <Avatar className="avatar centered" src={author.photoURL} alt={author.displayName}>{!author.photoURL && getInitials(author.displayName)}</Avatar>
            </div>
            <div className="col">
              <div className="row">
                <div className="col">
                  <h2 className="title">{author.displayName}</h2>
                </div>
                <div className="col-auto text-right hide-md">
                  <Link to="/authors" className="btn sm primary">Autori</Link>
                </div>
              </div>
              <div className="info-row bio text-left">
                <MinifiableText text={author.bio} source={author.source} maxChars={500} />
              </div>
            </div>
          </div>
        </div>
        
        {loadingBooks ? 
          <div aria-hidden="true" className="loader relative"><CircularProgress /></div>
        :
          <React.Fragment>
            {books ? 
              <div className="card light">
                <div className="shelf">
                  <div className="collection hoverable-items">
                    <div className="head nav">
                      <div className="row">
                        <div className="col">
                          <button 
                            type="button"
                            className="btn sm flat counter"
                            title={coverview ? 'Stack view' : 'Cover view'} 
                            onClick={this.onToggleView}>
                            {coverview ? icon.viewSequential() : icon.viewGrid()}
                          </button>
                          <span className="counter">{books.length || 0} libr{books.length === 1 ? 'o' : 'i'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`shelf-row books-per-row-4 ${coverview ? 'coverview' : 'stacked'}`}>
                      {covers}
                    </div>
                  </div>
                </div>
              </div>
            :
              <div className="info-row empty text-center pad-sm">
                <p>Non ci sono ancora libri di {author.displayName}</p>
                <Link to="/new-book" className="btn primary rounded">Aggiungi libro</Link>
              </div>
            }
          </React.Fragment>
        }
        <RandomQuote author={author.displayName} skeleton={false} className="card flat fadeIn slideUp reveal" />
      </div>
    );
  }
};