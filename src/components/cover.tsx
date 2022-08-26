import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import React, { FC, Fragment, useMemo } from 'react';
import { InView } from 'react-intersection-observer';
import { config } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, joinObj } from '../config/shared';
import '../css/cover.css';
import { BookModel, CoverModel, UserBookModel } from '../types';
import Rating from './rating';

const buildBackgrounds = (images: string[]): string => images.filter(Boolean).map((image: string): string => `url(${image})`).join(', ');

interface CoverProps {
  animationDelay?: boolean;
  bcid?: number;
  book?: BookModel | CoverModel | UserBookModel;
  full?: boolean;
  index?: number;
  loading?: boolean;
  info?: boolean;
  page?: number;
  rating?: boolean;
  showMedal?: boolean;
  showReaders?: boolean;
}

const Cover: FC<CoverProps> = ({
  animationDelay: animationdelay = false,
  bcid,
  book,
  full,
  index = 0,
  info,
  loading = false,
  page,
  rating,
  showMedal = true,
  showReaders = false,
}: CoverProps) => {

  const joinedAuthors = useMemo((): string => book ? joinObj(book.authors) : '', [book]);
  const stringified_readers_num = useMemo((): string => abbrNum((book as BookModel)?.readers_num || 0), [book]);
  
  const backgroundImage = useMemo((): string => {
    const images: string[] = [];
    const { bid, covers } = book || {};
    if (bid) images.push(`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/books%2F${bid}%2Fcover?alt=media`);
    if (covers?.length && !covers[0].includes('firebasestorage')) images.push(covers[0]);
    return buildBackgrounds(images);
  }, [book]);
  
  if (!book) return null;
  
  const delay: number = page && page > 1 ? 0 : index / 20;
  const hasBookmark: boolean = (book as CoverModel).readingState?.state_num === 2;
  const hasAward: boolean = ((book as BookModel).awards?.length || 0) > 0;
  const hasBcid: boolean = typeof bcid === 'number' && bcid > 0 && bcid < 1000;

  return (
    <div className='book'> 
      <InView triggerOnce rootMargin='130px'>
        {({ inView: inview, ref }) => (
          <div
            ref={ref}
            className='cover'
            title={book.title || undefined}
            style={{
              animationDelay: animationdelay !== false ? `${delay}s` : undefined,
              backgroundImage: inview ? backgroundImage : undefined,
            }}>
            {hasAward && showMedal && <div className='medal accent'>{icon.medal}</div>}
            {hasBcid && <div className='bookmark accent'><div>{bcid}</div></div>}
            {hasBookmark && <div className='bookmark' />}
            {(book as CoverModel).review?.text && <div className='cover-review'>Recensione</div>}
            {showReaders && (book as BookModel).readers_num ? <div className='readers-num'>{stringified_readers_num} {icon.account}</div> : ''}
            {loading ? <div aria-hidden='true' className='loader'><CircularProgress /></div> : <div className='overlay' />}
            {!backgroundImage && (
              <Fragment>
                <h2 className='title'>{book.title}</h2>
                {book.subtitle && <h3 className='subtitle'>{book.subtitle}</h3>}
                <span className='author'>{joinedAuthors}</span>
                {book.publisher && <span className='publisher'>{book.publisher}</span>}
              </Fragment>
            )}
          </div>
        )}
      </InView>
      {info !== false && (
        <div className='info'>
          <strong className='title'>{book.title}</strong>
          {joinedAuthors && (
            <span className='author'>
              <span className='hide-sm'>di</span> {joinedAuthors}
            </span>
          )}
          {full && book.publisher && <span className='publisher'>{book.publisher}</span>}
          {(book as CoverModel).readingState?.state_num === 2 && ((book as CoverModel).readingState?.progress_num || 0) > 0 ? (
            <Tooltip title={`${(book as CoverModel).readingState?.progress_num}%`} placement='top'>
              <progress max='100' value={(book as CoverModel).readingState?.progress_num} />
            </Tooltip>
          ) : (book.rating_num || 0) > 0 && rating !== false && (
            <Rating ratings={{ rating_num: book.rating_num, ratings_num: (book as BookModel).ratings_num }} />
          )}
        </div>
      )}
    </div>
  );
};
 
export default Cover;