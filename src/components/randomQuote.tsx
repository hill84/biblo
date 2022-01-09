import { DocumentData } from '@firebase/firestore-types';
import classnames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quotesRef } from '../config/firebase';
import { normURL } from '../config/shared';
import { QuoteModel } from '../types';
import MinifiableText from './minifiableText';

interface RandomQuoteProps {
  author?: string;
  // auto: boolean;
  className?: string;
  limit?: number;
  skeleton?: boolean;
}

interface StateModel {
  item: QuoteModel | null;
  loading: boolean;
  skeleton: boolean;
}

const initialState: StateModel = {
  item: null,
  loading: false,
  skeleton: true,
};

const RandomQuote: FC<RandomQuoteProps> = ({
  author = '',
  className = undefined,
  limit = 20,
  skeleton: _skeleton,
}: RandomQuoteProps) => {
  const [item, setItem] = useState<QuoteModel | null>(initialState.item);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const skeleton: boolean = _skeleton === undefined ? true : _skeleton;

  useEffect(() => {
    const ref = author ? quotesRef.where('author', '==', author).limit(1) : quotesRef.limit(limit);

    ref.get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        const count: number = snap.size;
        const randomIndex: number = Math.floor(Math.random() * count);
        const item: QuoteModel = snap.docs[randomIndex].data();
        
        setItem(item);
        setLoading(false);
      } else {
        setItem(null);
        setLoading(false);
      }
    }).catch((err: Error): void => console.warn(err));
  }, [author, limit]);

  if (loading) return skeleton ? <div className='skltn quote' /> : null;
  
  if (!item) return null;
  
  const bookURL = `/book/${item.bid}/${normURL(item.bookTitle)}`;
  
  return (
    <div className={classnames('randomquote', className)}>
      <div className='row'>
        {item.coverURL && (
          <div className='col-auto'>
            <Link to={bookURL} className='hoverable-items'>
              <div className='book'>
                <div className='cover' style={{ backgroundImage: `url(${item.coverURL})`, }} title={item.bookTitle}>
                  <div className='overlay' />
                </div>
              </div>
            </Link>
          </div>
        )}
        <div className='col'>
          <blockquote className='blockquote'>
            <div className='q'>
              <MinifiableText text={item.quote} maxChars={500} />
            </div>
            <p>
              {author ? '' : <span>– <Link to={`/author/${normURL(item.author)}`}>{item.author}</Link></span>}
              {!author && item.bookTitle && ', '}
              {item.bookTitle && <em>{item.bid ? <Link to={bookURL}>{item.bookTitle}</Link> : item.bookTitle}</em>}
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default RandomQuote;