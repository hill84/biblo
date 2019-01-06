import React from 'react';
import { Link } from 'react-router-dom';
import { quotesRef } from '../config/firebase';
import { boolType, numberType, stringType } from '../config/types';
import MinifiableText from './minifiableText';
import { skltn_rows } from './skeletons';

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
    auto: false,
    skeleton: typeof this.props.skeleton === 'undefined' ? true : this.props.skeleton
  }

  static propTypes = {
    author: stringType,
    auto: boolType,
    className: stringType,
    limit: numberType,
    skeleton: boolType,
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  fetch = () => {
    const { limit } = this.state;
    const { author } = this.props;
    const ref = author ? quotesRef.where('author', '==', author).limit(limit) : quotesRef.limit(this.props.limit || 20);

    ref.get().then(snap => {
      if (!snap.empty) {
        const count = snap.size;
        const randomIndex = Math.floor(Math.random() * count);
        const quote = snap.docs[randomIndex].data();
        if (this._isMounted) {
          this.setState({
            author: quote.author,
            bid: quote.bid,
            bookTitle: quote.bookTitle,
            coverURL: quote.coverURL,
            quote: quote.quote,
            loading: false
          });
        }
      } else {
        if (this._isMounted) {
          this.setState({
            author: '',
            bid: '',
            bookTitle: '',
            coverURL: '',
            quote: '',
            loading: false
          });
        }
      }
    }).catch(error => console.warn(error));
  }

  render() {
    const { author, bid, bookTitle, className, coverURL, loading, quote, skeleton } = this.state;

    if (loading) {
      return skeleton ? skltn_rows : null
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
                    <div className="overlay" />
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