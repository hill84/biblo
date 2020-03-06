import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import React, { useMemo } from 'react';
import { InView } from 'react-intersection-observer';
import icon from '../config/icons';
import { abbrNum, joinObj } from '../config/shared';
import { boolType, coverType, numberType } from '../config/types';
import Rating from './rating';
import '../css/cover.css';

const Cover = props => {
  const { animationDelay, bcid, book, full, index, info, loading, page, rating, showMedal, showReaders } = props;
  const cover = useMemo(() => book?.covers?.[0] || '', [book]);
  const delay = useMemo(() => page && page > 1 ? 0 : index / 20, [index, page]);
  const hasBookmark = useMemo(() => book?.readingState?.state_num === 2, [book]);
  const hasAward = useMemo(() => book?.awards?.length > 0, [book]);
  const hasBcid = useMemo(() => bcid > 0 && bcid < 999, [bcid]);
  const joinedAuthors = useMemo(() => book && joinObj(book.authors), [book]);
  const readers_num = useMemo(() => book && abbrNum(book.readers_num), [book]);

  return (
    <div className="book"> 
      <InView triggerOnce rootMargin="130px">
        {({ inView, ref }) => (
          <div
            ref={ref}
            className="cover"
            title={book ? book.title : null}
            style={{
              animationDelay: (animationDelay !== false) ? `${delay}s` : '',
              backgroundImage: inView ? cover ? `url(${cover})` : null : null, 
            }}>
            {hasAward && showMedal && <div className="medal accent">{icon.medal}</div>}
            {hasBcid && <div className="bookmark accent"><div>{bcid}</div></div>}
            {hasBookmark && <div className="bookmark" />}
            {book?.review?.text && <div className="cover-review">Recensione</div>}
            {showReaders && book?.readers_num ? <div className="readers-num">{readers_num} {icon.account}</div> : ''}
            {loading ? <div aria-hidden="true" className="loader"><CircularProgress /></div> : <div className="overlay" />}
            {!cover && book && (
              <>
                <h2 className="title">{book.title}</h2>
                {book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
                <span className="author">{joinedAuthors}</span>
                {book.publisher && <span className="publisher">{book.publisher}</span>}
              </>
            )}
          </div>
        )}
      </InView>
      {info !== false && (
        <div className="info">
          <strong className="title">{book.title}</strong>
          <span className="author"><span className="hide-sm">di</span> {joinedAuthors}</span>
          {full && book.publisher && <span className="publisher">{book.publisher}</span>}
          {book.readingState?.state_num === 2 && book.readingState?.progress_num > 0 ? (
            <Tooltip title={`${book.readingState.progress_num}%`} placement="top">
              <progress max="100" value={book.readingState.progress_num} />
            </Tooltip>
          ) : book.rating_num > 0 && rating !== false && (
            <Rating ratings={{ rating_num: book.rating_num, ratings_num: book.ratings_num }} />
          )}
        </div>
      )}
    </div>
  );
}

Cover.propTypes = {
  animationDelay: boolType,
  bcid: numberType,
  book: coverType,
  full: boolType,
  index: numberType,
  loading: boolType,
  info: boolType,
  page: numberType,
  rating: boolType,
  showMedal: boolType,
  showReaders: boolType
}

Cover.defaultProps = {
  animationDelay: false,
  bcid: null,
  book: {
    bid: 'unknown',
    title: 'Titolo',
    pages: 0,
    authors: { Autore: true }
  },
  full: null,
  index: 0,
  info: null,
  loading: false,
  page: null,
  rating: null,
  showMedal: true,
  showReaders: false
}
 
export default Cover;