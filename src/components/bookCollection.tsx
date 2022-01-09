import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import { Tooltip } from '@material-ui/core';
import classnames from 'classnames';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksRef, collectionBooksRef } from '../config/firebase';
import icon from '../config/icons';
import { GenreModel, genres } from '../config/lists';
import { booksPerRow as _booksPerRow, denormURL, handleFirestoreError /* , isTouchDevice */, normURL } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import { CollectionBookModel, CurrentTarget } from '../types';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

interface BookCollectionProps {
  cid: string;
  bcid?: string;
  booksPerRow?: number;
  desc?: boolean;
  inView?: boolean;
  limit?: number;
  pagination?: boolean;
  rating?: boolean;
  scrollable?: boolean;
  stacked?: boolean;
}

interface StateModel {
  collection: CollectionBookModel[];
  count: number;
  desc: boolean;
  loading: boolean;
  page: number;
}

const initialState: StateModel = {
  collection: [],
  count: 0,
  desc: false,
  loading: true,
  page: 1,  
};

const BookCollection: FC<BookCollectionProps> = ({
  bcid = 'bcid',
  booksPerRow = 1,
  cid,
  desc: _desc = false,
  inView = true,
  limit: _limit = 0,
  pagination = false,
  rating = true,
  scrollable = false,
  stacked = false,
}: BookCollectionProps) => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [collection, setCollection] = useState<CollectionBookModel[]>(initialState.collection);
  const [count, setCount] = useState<number>(initialState.count);
  const [desc, setDesc] = useState<boolean>(_desc);
  // const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [page, setPage] = useState<number>(initialState.page);

  const limit = useMemo((): number => _limit || (pagination ? _booksPerRow() : 98), [pagination, _limit]);
  
  const fetch = useCallback((e?: MouseEvent): void => {
    const direction: string = (e?.currentTarget as CurrentTarget)?.dataset?.direction || '';
    const prev: boolean = direction === 'prev';
    // const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter: number = prev ? page > 1 ? (page - 1) * limit - limit : 0 : ((page * limit) > count) ? (page - 1) * limit : page * limit;
    const isGenre: boolean = genres.some((item: GenreModel): boolean => item.name === cid);
    const creationThreshold: number = new Date().getTime() - 1_800_000; // now - 30 minutes
    let baseRef: Query<DocumentData>;

    switch (cid) {
      case 'Top': baseRef = booksRef.orderBy('readers_num', 'desc'); break;
      case 'New': baseRef = booksRef.where('EDIT.created_num', '<', creationThreshold).orderBy('EDIT.created_num', 'desc'); break;
      default: baseRef = isGenre ? (
        booksRef.where('genres', 'array-contains', denormURL(cid)).orderBy('rating_num', desc ? 'desc' : 'asc').orderBy('EDIT.created_num', desc ? 'desc' : 'asc')
      ) : ( 
        collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title')
      ); break;
    }
    
    const lRef: Query<DocumentData> = baseRef.limit(limit);
    const paginatedRef: Query<DocumentData> = lRef.startAfter(startAfter);
    const ref: Query<DocumentData> = direction ? paginatedRef : lRef;
    
    setLoading(true);
    if (inView) {
      const fetcher = (): void => {
        ref.get().then((snap: DocumentData): void => {
          if (!snap.empty) {
            const books: CollectionBookModel[] = [];
            snap.forEach((book: DocumentData): number => books.push(book.data()));
            setCollection(books);
            // setLastVisible(snap.docs[snap.docs.length - 1] || lastVisible);
            setPage(page => (direction ? prev ? page > 1 ? page - 1 : 1 : ((page * limit) > count) ? page : page + 1 : 1));
            // console.log({ 'direction': direction, 'page': page });
          } else {
            // setLastVisible(null);
            setCollection(initialState.collection);
            setCount(initialState.count);
            setPage(initialState.page);
          }
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        }).finally((): void => {
          setLoading(false);
        });
      };

      if (cid === 'Top' || cid === 'New') {
        setCount(limit);
        fetcher();
      } else if (!direction) {
        lRef.get().then(fullSnap => {
          if (!fullSnap.empty) { 
            setCount(fullSnap.docs.length);
            fetcher();
          }
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      } else fetcher();
    }
  }, [bcid, cid, count, desc, inView, limit, openSnackbar, page]);
  
  useEffect(() => {
    fetch();
  }, [fetch]);

  const covers = (collection?.length ? (
    <div className={classnames(`shelf-row books-per-row-${booksPerRow}`, stacked ? 'stacked' : 'abreast')}>
      {collection.map((book: CollectionBookModel, i: number) => 
        <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}>
          <Cover book={book} rating={rating} full={stacked} index={i} bcid={book.bcid} showReaders={cid === 'Top'} />
        </Link>
      )}
    </div>
  ) : ( 
    <div className="info-row empty">Non ci sono libri in questa collezione.</div>
  ));

  const hasMore: boolean = pagination && count > limit;
  const isGenre = useMemo((): boolean => genres.some(item => item.name === cid), [cid]);

  return (
    <Fragment>
      <div className="head nav" role="navigation">
        <span className="counter last title"><span className="primary-text hide-sm">{isGenre ? 'Genere' : 'Collezione'}:</span> {cid}</span> {count !== 0 && <span className="count hide-xs">({count} libri)</span>} 
        {!loading && count > 0 && (
          <div className="pull-right">
            {hasMore || scrollable ? (
              cid === 'Top' ? 'I più amati' : cid === 'New' ? 'Le nostre novità' : ( 
                <button type="button" className="btn sm flat counter"><Link to={`/${isGenre ? 'genre' : 'collection'}/${normURL(cid)}`}>Vedi tutti</Link></button>
              )
            ) : (
              <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                <span>
                  <button
                    type="button"
                    className={classnames('btn', 'sm', 'icon', 'flat', 'counter', desc ? 'desc' : 'asc')}
                    onClick={() => setDesc(desc => !desc)}
                    disabled={count < 2}>
                    {icon.arrowDown}
                  </button>
                </span>
              </Tooltip>
            )}
            {hasMore && (
              <Fragment>
                <button 
                  type="button"
                  disabled={page < 2} 
                  className="btn sm flat icon rounded" 
                  data-direction="prev"
                  onClick={fetch} title="precedente">
                  {icon.chevronLeft}
                </button>
                <button 
                  type="button"
                  disabled={page > (count / limit)} 
                  className="btn sm flat icon rounded" 
                  data-direction="next"
                  onClick={fetch} title="successivo">
                  {icon.chevronRight}
                </button>
              </Fragment>
            )}
          </div>
        )}
      </div>

      <div className={classnames('shelf', 'collection', 'hoverable-items', { scrollable })}>
        {loading ? stacked ? skltn_shelfStack : skltn_shelfRow : covers}
      </div>
    </Fragment>
  );
};
 
export default BookCollection;