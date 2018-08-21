import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { quotesRef } from '../config/firebase';
import { boolType, numberType, stringType } from '../config/types';
import MinifiableText from './minifiableText';

export default class RandomQuote extends React.Component {
  state = {
    className: this.props.className || '',
    author: this.props.author || '',
    bid: '',
    bookTitle: '',
    coverURL: '',
    quote: '',
    limit: this.props.limit || 1,
    loading: true,
    auto: false
  }

  static propTypes = {
    author: stringType,
    auto: boolType,
    className: stringType,
    limit: numberType
  }

  componentDidMount() {
    this.fetch();
  }
  
  fetch = () => {
    const { limit } = this.state;
    const { author } = this.props;
    const ref = author ? quotesRef.where('author', '==', author).limit(limit) : quotesRef.limit(this.props.limit || 20);

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
          quote: quote.quote,
          loading: false
        });
      } else {
        this.setState({
          author: '',
          bid: '',
          bookTitle: '',
          coverURL: '',
          quote: '',
          loading: false
        });
      }
    }).catch(error => console.warn(error));
  }

  render() {
    const { author, bid, bookTitle, className, coverURL, loading, quote } = this.state;

    if (loading) {
      return <div className="loader"><CircularProgress /></div>
    } else if (!quote) { 
      return null 
    }

    return (
      <div className={`randomquote ${className}`}>
        <div className="row">
          {coverURL && !this.props.author &&
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
                <p>– {this.props.author ? author : <Link to={`/author/${author}`}>{author}</Link>}{bookTitle && <em>, {bid ? <Link to={`/book/${bid}`}>{bookTitle}</Link> : bookTitle}</em>}</p>
            </blockquote>
          </div>
        </div>
      </div>
    )
  }
}