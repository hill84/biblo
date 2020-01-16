import { Tooltip } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksRef, collectionBooksRef } from '../config/firebase';
import icon from '../config/icons';
import { genres } from '../config/lists';
import { booksPerRow as _booksPerRow, denormURL, handleFirestoreError /* , isTouchDevice */, normURL } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

const BookCollection = props => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [state, setState] = useState({
    booksPerRow: props.booksPerRow,
    limit:  props.limit || (props.pagination ? _booksPerRow() : 98),
    collection: [],
    count: 0,
    desc: props.desc,
    loading: true,
    page: null,
    // lastVisible: null
  });

  const { bcid, cid, inView, pagination, scrollable, stacked } = props;
  const { booksPerRow, collection, count, desc, limit, loading, page } = state;

  const is = useRef(true);
  
  const fetch = useCallback(e => {
    const direction = e && e.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    // const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter = prev ? page > 1 ? (page - 1) * limit - limit : 0 : ((page * limit) > count) ? (page - 1) * limit : page * limit;
    const isGenre = genres.some(item => item.name === cid);
    let baseRef

    switch (cid) {
      case 'Top': baseRef = booksRef.orderBy('readers_num', 'desc'); break;
      case 'New': baseRef = booksRef.orderBy('EDIT.created_num', 'desc'); break;
      default: baseRef = isGenre ? (
        booksRef.where('genres', 'array-contains', denormURL(cid)).orderBy('rating_num', desc ? 'desc' : 'asc').orderBy('EDIT.created_num', desc ? 'desc' : 'asc')
      ) : ( 
        collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title')
      ); break;
    }
    
    const lRef = baseRef.limit(limit);
    const paginatedRef = lRef.startAfter(startAfter);
    const ref = direction ? paginatedRef : lRef;
    
    if (is.current) setState(prevState => ({ ...prevState, loading: true }));

    if (inView) {
      const fetcher = () => {
        ref.get().then(snap => {
          if (!snap.empty) {
            const books = [];
            snap.forEach(book => books.push(book.data()));
            if (is.current) {
              setState(prevState => ({
                ...prevState,
                collection: books,
                loading: false,
                page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1,
                // lastVisible: snap.docs[snap.docs.length - 1] || prevState.lastVisible
              }));
            }
            // console.log({ 'direction': direction, 'page': page });
          } else if (is.current) {
            setState(prevState => ({ 
              ...prevState,  
              count: 0,
              collection: [],
              loading: false,
              page: null,
              // lastVisible: null
            }));
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }

      if (cid === 'Top' || cid === 'New') {
        setState(prevState => ({ ...prevState, count: limit }));
        fetcher();
      } else if (!direction) {
        lRef.get().then(fullSnap => {
          if (!fullSnap.empty) { 
            if (is.current) {
              setState(prevState => ({ ...prevState, count: fullSnap.docs.length }));
              fetcher();
            }
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else fetcher();
    }
  }, [bcid, cid, count, desc, inView, limit, openSnackbar, page]);
  
  useEffect(() => {
    fetch();
  }, [fetch]);
  
  useEffect(() => () => {
    is.current = false;
  }, []);

  const onToggleDesc = () => setState(prevState => ({ ...prevState, desc: !prevState.desc }));

  const covers = (collection && collection.length ? (
    <div className={`shelf-row books-per-row-${booksPerRow} ${stacked ? 'stacked' : 'abreast'}`}>
      {collection.map((book, i) => 
        <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}>
          <Cover book={book} rating full={stacked} index={i} bcid={book.bcid} showReaders={cid === 'Top'} />
        </Link>
      )}
    </div>
  ) : ( 
    <div className="info-row empty">Non ci sono libri in questa collezione.</div>
  ));

  const isGenre = genres.some(item => item.name === cid);

  return (
    <>
      <div className="head nav" role="navigation" ref={is}>
        <span className="counter last title"><span className="primary-text hide-sm">{isGenre ? 'Genere' : 'Collezione'}:</span> {cid}</span> {count !== 0 && <span className="count hide-xs">({count} libri)</span>} 
        {!loading && count > 0 && (
          <div className="pull-right">
            {(pagination && count > limit) || scrollable ? (
              cid === 'Top' ? (
                `I più amati`
              ) : cid === 'New' ? (
                "Le nostre novità"
              ) : ( 
                <button type="button" className="btn sm flat counter"><Link to={`/${isGenre ? 'genre' : 'collection'}/${normURL(cid)}`}>Vedi tutti</Link></button>
              )
            ) : (
              <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                <span>
                  <button
                    type="button"
                    className={`btn sm icon flat counter ${desc ? 'desc' : 'asc'}`}
                    onClick={onToggleDesc}
                    disabled={count < 2}>
                    {icon.arrowDown}
                  </button>
                </span>
              </Tooltip>
            )}
            {pagination && count > limit && (
              <>
                <button 
                  type="button"
                  disabled={page < 2 && 'disabled'} 
                  className="btn sm flat icon rounded" 
                  data-direction="prev"
                  onClick={fetch} title="precedente">
                  {icon.chevronLeft}
                </button>
                <button 
                  type="button"
                  disabled={page > (count / limit) && 'disabled'} 
                  className="btn sm flat icon rounded" 
                  data-direction="next"
                  onClick={fetch} title="successivo">
                  {icon.chevronRight}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className={`shelf collection hoverable-items ${scrollable ? 'scrollable' : ''}`}>
        {loading ? stacked ? skltn_shelfStack : skltn_shelfRow : covers}
      </div>
    </>
  );
}

BookCollection.propTypes = {
  cid: stringType.isRequired,
  bcid: stringType,
  booksPerRow: numberType,
  desc: boolType,
  inView: boolType,
  limit: numberType,
  pagination: boolType,
  scrollable: boolType,
  stacked: boolType
}

BookCollection.defaultProps = {
  bcid: 'bcid',
  booksPerRow: 1,
  desc: false,
  inView: true,
  limit: null,
  pagination: false,
  scrollable: false,
  stacked: false
}
 
export default BookCollection;