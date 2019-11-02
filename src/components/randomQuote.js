import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quotesRef } from '../config/firebase';
import { normURL } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import MinifiableText from './minifiableText';

const RandomQuote = props => {
  const [state, setState] = useState({
    loading: true,
    // auto: false,
    skeleton: props.skeleton === null ? true : props.skeleton
  });
  
  const { author, className, limit } = props;
  const { item, loading, skeleton } = state;

  useEffect(() => {
    const ref = author ? quotesRef.where('author', '==', author).limit(1) : quotesRef.limit(limit);

    ref.get().then(snap => {
      if (!snap.empty) {
        const count = snap.size;
        const randomIndex = Math.floor(Math.random() * count);
        const item = snap.docs[randomIndex].data();
        setState(prevState => ({
          ...prevState,
          item,
          loading: false
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          item: null,
          loading: false
        }));
      }
    }).catch(err => console.warn(err));
  }, [author, limit]);

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

RandomQuote.propTypes = {
  author: stringType,
  // auto: boolType,
  className: stringType,
  limit: numberType,
  skeleton: boolType,
}

RandomQuote.defaultProps = {
  author: null,
  className: null,
  limit: 20,
  skeleton: null
}

export default RandomQuote;