import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { authorRef, booksRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { getInitials, normalizeString } from '../../config/shared';
import Cover from '../cover';
import NoMatch from '../noMatch';
import MinifiableText from '../minifiableText';
import RandomQuote from '../randomQuote';

export default class Author extends React.Component {
  state = {
    author: {
      bio: '',
      displayName: this.props.match.params.aid || '',
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
    coverview: false,
    loading: true,
    loadingBooks: true
  }

  componentDidMount() {
    const { author } = this.state;
		authorRef(`${normalizeString(author.displayName)}`).get().then(snap => {
			if (snap.exists) {
				this.setState({ author: snap.data(), loading: false });
			} else {
				this.setState({ loading: false });
			}
    }).catch(error => console.warn(error));
    booksRef.where(`authors.${author.displayName}`, '==', true).get().then(snap => {
      if (!snap.empty) {
        const books = [];
        snap.forEach(book => books.push(book.data()));
        // console.log(books);
        this.setState({ books, loadingBooks: false });
      } else {
        this.setState({ books: null, loadingBooks: false });
      }
		}).catch(error => console.warn(error));
  }
  
  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview }));

  render() {
    const { author, books, coverview, loading, loadingBooks } = this.state;

    const covers = books && books.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} /></Link>);

    if (loading) {
      return <div className="loader"><CircularProgress /></div>
    } else if (!author.lastEditByUid && !books) {
      return <NoMatch title="Autore non trovato" location={this.props.location} />
    }

    return (
      <div className="container" id="authorComponent">
        <div className="card dark" id="authorCard">
          <div className="row text-center-md">
            <div className="col-md-auto col-sm-12">
              <Avatar className="avatar centered" src={author.photoURL} alt={author.displayName}>{!author.photoURL && getInitials(author.displayName)}</Avatar>
            </div>
            <div className="col">
              <h2 className="title">{author.displayName}</h2>
              <div className="info-row bio">
                <MinifiableText text={author.bio} maxChars={500} />
              </div>
              <RandomQuote author={author.displayName} skeleton={false} className="fadeIn slideUp reveal" />
            </div>
          </div>
        </div>
        
        {loadingBooks ? 
          <div className="loader relative"><CircularProgress /></div>
        :
          <React.Fragment>
            {books ? 
              <div className="card">
                <div className="shelf">
                  <div className="collection hoverable-items">
                    <div className="head nav">
                      <div className="row">
                        <div className="col">
                          <button 
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
                <Link to="/new-book" className="btn primary">Aggiungi libro</Link>
              </div>
            }
          </React.Fragment>
        }

      </div>
    );
  }
};