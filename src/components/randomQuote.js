import React from 'react';
import { Link } from 'react-router-dom';
import { quotesRef } from '../config/firebase';
import { normURL } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import MinifiableText from './minifiableText';

export default class RandomQuote extends React.Component {
  state = {
    loading: true,
    // auto: false,
    skeleton: this.props.skeleton === null ? true : this.props.skeleton
  }

  static propTypes = {
    author: stringType,
    // auto: boolType,
    className: stringType,
    limit: numberType,
    skeleton: boolType,
  }

  static defaultProps = {
    author: null,
    className: null,
    limit: 20,
    skeleton: null
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  
  fetch = () => {
    const { author, limit } = this.props;
    const ref = author ? quotesRef.where('author', '==', author).limit(1) : quotesRef.limit(limit);

    ref.get().then(snap => {
      if (!snap.empty) {
        const count = snap.size;
        const randomIndex = Math.floor(Math.random() * count);
        const item = snap.docs[randomIndex].data();
        if (this._isMounted) {
          this.setState({
            item,
            loading: false
          });
        }
      } else if (this._isMounted) {
        this.setState({
          item: null,
          loading: false
        });
      }
    }).catch(error => console.warn(error));
  }

  render() {
    const { item, loading, skeleton } = this.state;
    const { author, className } = this.props;

    if (loading) return skeleton ? <div className="skltn quote" /> : null;
    if (!item) return null;

    return (
      <div className={`randomquote ${className}`}>
        <div className="row">
          {item.coverURL &&
            <div className="col-auto">
              <Link to={`/book/${item.bid}/${normURL(item.bookTitle)}`} className="hoverable-items">
                <div className="book">
                  <div className="cover" style={{ backgroundImage: `url(${item.coverURL})`, }} title={item.bookTitle}>
                    <div className="overlay" />
                  </div>
                </div>
              </Link>
            </div>
          }
          <div className="col">
            <blockquote className="blockquote">
              <div className="q"><MinifiableText text={item.quote} limit={500} /></div>
              <p>
                {author ? '' : <span>– <Link to={`/author/${normURL(item.author)}`}>{item.author}</Link></span>}
                {!author && item.bookTitle && ', '}
                {item.bookTitle && <em>{item.bid ? <Link to={`/book/${item.bid}/${normURL(item.bookTitle)}`}>{item.bookTitle}</Link> : item.bookTitle}</em>}
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    );
  }
}