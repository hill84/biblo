import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { quotesRef } from '../config/firebase';
import { boolType, stringType } from '../config/types';
import MinifiableText from './minifiableText';

export default class RandomQuote extends React.Component {
  state = {
    author: this.props.author || '',
    bid: '',
    bookTitle: '',
    coverURL: '',
    quote: '',
    auto: false
  }

  static propTypes = {
    author: stringType,
    auto: boolType
  }

  componentDidMount() {
    this.fetchRandomQuote();
  }
  
  fetchRandomQuote = () => {
    let ref = quotesRef();

    if (this.props.author) { ref = quotesRef().where('author', '==', this.props.author).limit(30); }
    ref.get().then(snap => {
      if (!snap.empty) {
        //console.log(snap);
        const count = snap.size;
        const randomIndex = Math.floor(Math.random() * count);
        const quote = snap.docs[randomIndex].data();

        this.setState({
          author: quote.author,
          bid: quote.bid,
          bookTitle: quote.bookTitle,
          coverURL: quote.coverURL,
          quote: quote.quote
        });
      } else {
        this.setState({
          author: '',
          bid: '',
          bookTitle: '',
          coverURL: '',
          quote: ''
        });
      }
    }).catch(error => console.warn(`Error fetching quotes: ${error}`));
  }

  render() {
    const { author, bid, bookTitle, coverURL, quote } = this.state;

    if (!quote) return <div className="loader"><CircularProgress /></div>

    return (
      <div className="row randomquote">
        {coverURL && 
          <div className="col-auto">
            <Link to={`/book/${bid}`} className="hoverable-items">
              <div className="book">
                <div className="cover" style={{backgroundImage: `url(${coverURL})`}} title={bookTitle}>
                  <div className="overlay"></div>
                </div>
              </div>
            </Link>
          </div>
        }
        <div className="col">
          <blockquote className="blockquote">
            <div className="q"><MinifiableText text={quote} limit={500} /></div>
            <p>– <Link to={`/author/${author}`}>{author}</Link>{bookTitle && <em>, {bid ? <Link to={`/book/${bid}`}>{bookTitle}</Link> : bookTitle}</em>}</p>
          </blockquote>
        </div>
      </div>
    )
  }
}