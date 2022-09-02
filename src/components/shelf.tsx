import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import { Tooltip } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import React, { Dispatch, FC, Fragment, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { userBooksRef, userChallengeRef, userChallengesRef } from '../config/firebase';
import icon from '../config/icons';
import { ListModel, userBookTypes } from '../config/lists';
import { handleFirestoreError, normURL } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import { BookModel, BookshelfType, CurrentTarget, IsCurrent, OrderByModel, UserBookModel, UserChallengeModel } from '../types';
import Cover from './cover';
import PaginationControls from './paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

const filterBy: ListModel[] = userBookTypes;

let userBooksFetchCanceler: (() => void) | null = null;
let userBooksFullFetchCanceler: (() => void) | null = null;

const pagination = true;

interface StateModel {
  coverview: boolean;
  desc: boolean;
  filterByIndex: number;
  filterMenuAnchorEl: null;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl: null;
  page: number;
}

const initialState: StateModel = {
  coverview: true,
  desc: true,
  filterByIndex: 0,
  filterMenuAnchorEl: null,
  loading: true,
  orderByIndex: 0,
  orderMenuAnchorEl: null,
  page: 1,
};

interface ShelfProps {
  count: number;
  items: Array<BookModel | UserBookModel>;
  limit: number;
  luid: string;
  setCount: Dispatch<SetStateAction<number>>;
  setItems: Dispatch<SetStateAction<Array<BookModel>>>;
  shelf: BookshelfType;
  uid: string;
}

const Shelf: FC<ShelfProps> = ({
  count,
  items,
  limit,
  luid,
  setCount,
  setItems,
  shelf = 'shelf',
  uid
}: ShelfProps) => {
  const isOwner = luid === uid;
  const { openSnackbar } = useContext(SnackbarContext);
  const [coverview, setCoverview] = useState<StateModel['coverview']>(initialState.coverview);
  const [desc, setDesc] = useState<StateModel['desc']>(initialState.desc);
  const [filterByIndex, setFilterByIndex] = useState<StateModel['filterByIndex']>(initialState.filterByIndex);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<StateModel['filterMenuAnchorEl']>(initialState.filterMenuAnchorEl);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);

  const { t } = useTranslation(['common', 'lists']);

  const is = useRef<IsCurrent>(true);

  const orderBy = useMemo((): OrderByModel[] => [ 
    { type: 'added_num', label: t('ADDED_DATE'), icon: icon.calendar }, 
    { type: 'title', label: t('TITLE'), icon: icon.formatTitle }, 
    { type: 'rating_num', label: t('RATING'), icon: icon.star }, 
    { type: 'authors', label: t('AUTHOR'), icon: icon.accountEdit }
  ], [t]);

  const fetchChallenges = useCallback((fullBooks: UserBookModel[]): void => {
    if (!isOwner) return;
    userChallengesRef(luid).get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        const challenges: UserChallengeModel[] = [];
        snap.forEach((doc: DocumentData): number => challenges.push(doc.data()));
        // UPDATE READING STATE OF CHALLENGE BOOKS 
        const { cid } = challenges[0];
        const cBooks: UserChallengeModel['books'] = { ...challenges[0].books };
        Object.keys(cBooks).filter((bid: string): boolean => !cBooks[bid]).forEach((bid: string): void => {
          fullBooks.filter((item: UserBookModel): boolean => item.bid === bid && item.readingState.state_num === 3).forEach((item: UserBookModel): void => {
            cBooks[item.bid] = true;
          });
        });
        Object.keys(cBooks).filter((bid: string): boolean => cBooks[bid]).forEach((bid: string): void => {
          fullBooks.filter((item: UserBookModel): boolean => item.bid === bid && item.readingState.state_num !== 3).forEach((item: UserBookModel): void => {
            cBooks[item.bid] = false;
          });
        });
        if (JSON.stringify(cBooks) !== JSON.stringify(challenges[0].books)) {
          console.warn(cBooks);
          userChallengeRef(luid, cid).update({ 
            books: cBooks, 
            completed_num: Object.keys(cBooks).filter(bid => !cBooks[bid]).length === 0 ? Date.now() : 0
          }).then().catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
        } // else console.log('No challenge books to update');
      }
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  }, [isOwner, luid, openSnackbar]);

  const setEmptyState = useCallback((): void => {
    if (!is.current) return;
    setCount(0);
    setItems([]);
    setLoading(false);
    setPage(1);
  }, [setCount, setItems]);

  const shelfRef = useMemo((): Query<DocumentData> => {
    const fieldPath: 'bookInShelf' | 'bookInWishlist' = shelf === 'shelf' ? 'bookInShelf' : 'bookInWishlist';
    const baseRef: Query<DocumentData> = userBooksRef(uid).where(fieldPath, '==', true).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
    return filterByIndex !== 0 ? baseRef.where('readingState.state_num', '==', filterByIndex) : baseRef;
  }, [desc, filterByIndex, orderBy, orderByIndex, shelf, uid]);

  const fetch = useCallback((): void => {
    if (!limit) return;
    userBooksFullFetchCanceler = shelfRef.onSnapshot((fullSnap: DocumentData): void => {
      // console.log({ fullSnap });
      if (!fullSnap.empty) {
        const count: number = fullSnap.docs.length;
        if (is.current) setCount(count);
        const fullBooks: UserBookModel[] = [];
        fullSnap.forEach((fullUserBook: DocumentData): number => fullBooks.push({ 
          bid: fullUserBook.id, 
          readingState: { state_num: fullUserBook.data().readingState.state_num }
        } as UserBookModel));
        
        userBooksFetchCanceler = shelfRef.limit(limit).onSnapshot((snap: DocumentData): void => {
          // console.log({ snap });
          if (!snap.empty) {
            const items: BookModel[] = [];
            snap.forEach((userBook: DocumentData): number => items.push({ ...userBook.data(), bid: userBook.id }));
            // console.log({ direction, limit, page, count });
            // console.log({ items });
            if (is.current && count) {
              setItems(items);
              setLoading(false);
            }
            fetchChallenges(fullBooks);
          } else setEmptyState();
        });
      } else setEmptyState();
    });
  }, [fetchChallenges, limit, setCount, setEmptyState, setItems, shelfRef]);

  const getStartAtIndex = useCallback(prev => prev ? ((page - 1) * limit) - limit : page * limit, [limit, page]);

  const fetchNext = useCallback((e): void => {
    if (!limit) return;
    const direction: string | undefined = (e.currentTarget as CurrentTarget).dataset?.direction;
    const prev: boolean = direction === 'prev';

    userBooksFullFetchCanceler = shelfRef.onSnapshot((fullSnap: DocumentData): void => {
      if (!fullSnap.empty) {
        const count: number = fullSnap.docs.length;
        if (is.current) setCount(count);
        const fullBooks: UserBookModel[] = [];
        fullSnap.forEach((fullUserBook: DocumentData): number => fullBooks.push({ 
          bid: fullUserBook.id,
          readingState: { state_num: fullUserBook.data().readingState.state_num },
        } as UserBookModel));

        const ref: Query<DocumentData> = shelfRef.startAt(fullSnap.docs[getStartAtIndex(prev)]);
        
        userBooksFetchCanceler = ref.limit(limit).onSnapshot((snap: DocumentData): void => {
          if (!snap.empty) {
            const items: BookModel[] = [];
            snap.forEach((userBook: DocumentData): number => items.push({ ...userBook.data(), bid: userBook.id }));
            // console.log({ direction, limit, page, count });
            if (is.current && count) {
              setItems(items);
              setPage(page => (prev ? page > 1 ? page - 1 : 1 : page * limit > count ? page : page + 1));
              setLoading(false);
            }
            fetchChallenges(fullBooks);
          } else setEmptyState();
        }, (err: FirestoreError): void => console.warn(err));
      } else setEmptyState();
    }, (err: FirestoreError): void => console.warn(err));
  }, [fetchChallenges, getStartAtIndex, limit, setCount, setEmptyState, setItems, shelfRef]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
    userBooksFullFetchCanceler?.();
    userBooksFetchCanceler?.();
  }, []);

  const onChangeOrderBy = useCallback((i: number): void => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
    setPage(1);
  }, []);

  const onChangeFilterBy = useCallback((i: number): void => {
    setFilterByIndex(i);
    setFilterMenuAnchorEl(null);
    setPage(1);
  }, []);

  const onToggleDesc = useCallback((): void => setDesc(desc => !desc), []);

  const onToggleView = useCallback((): void => setCoverview(coverview => !coverview), []);

  const onOpenOrderMenu = useCallback((e): void => setOrderMenuAnchorEl(e.currentTarget), []);
  
  const onCloseOrderMenu = useCallback((): void => setOrderMenuAnchorEl(null), []);

  const onOpenFilterMenu = useCallback((e): void => {
    e.persist();
    if (is.current) setFilterMenuAnchorEl(e.currentTarget);
  }, []);

  const onCloseFilterMenu = useCallback((): void => setFilterMenuAnchorEl(null), []);

  const covers = useMemo(() => items?.length > 0 && items?.map((book: BookModel | UserBookModel, i: number) => (
    <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}>
      <Cover book={book} index={i} rating={shelf === 'shelf'} />
    </Link>
  )), [items, shelf]);

  const filterByOptions = useMemo(() => filterBy.map(({ label, name }: ListModel, i: number) => (
    <MenuItem
      key={i}
      disabled={i === -1}
      selected={i === filterByIndex}
      onClick={() => onChangeFilterBy(i)}>
      {t(`lists:${label || name}`)}
    </MenuItem>
  )), [filterByIndex, onChangeFilterBy, t]);

  const orderByOptions = useMemo(() => orderBy.map((option, i: number) => (
    <MenuItem
      key={option.type}
      className={shelf !== 'shelf' && option.type === 'rating_num' ? 'hide-always' : ''}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={() => onChangeOrderBy(i)}>
      <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
      <Typography variant='inherit'>{orderBy[i].label}</Typography>
    </MenuItem>
  )), [onChangeOrderBy, orderBy, orderByIndex, shelf]);

  const EmptyState = useCallback(() => (
    <div className='info-row empty text-center'>
      {t('EMPTY_LIST')}
    </div>
  ), [t]);

  if (!limit) return null;

  return (
    <div className='shelf' ref={is}>
      <div className='collection hoverable-items'>
        <div className='head nav'>
          <div className='row'>
            <div className='col'>
              <button 
                type='button'
                className='btn sm flat counter icon' 
                disabled={!count}
                title={coverview ? 'Stack view' : 'Cover view'} 
                onClick={onToggleView}>
                {coverview ? icon.viewSequential : icon.viewGrid}
              </button>
              {shelf === 'shelf' && (
                <Fragment>
                  <button 
                    type='button'
                    className='btn sm flat counter' 
                    // disabled={!count}
                    onClick={onOpenFilterMenu}>
                    {t(`lists:${filterBy[filterByIndex].label || 'FILTER_BOOK_TYPE_ALL'}`)}
                  </button>
                  <Menu 
                    className='dropdown-menu'
                    anchorEl={filterMenuAnchorEl} 
                    open={Boolean(filterMenuAnchorEl)} 
                    onClose={onCloseFilterMenu}>
                    {filterByOptions}
                  </Menu>
                </Fragment>
              )}
              <span className='counter last hide-sm'>
                {count !== items.length ? `${items.length} ${t('OF')} ` : ''}{t('BOOKS_COUNT', { count })}
              </span>
            </div>
            <div className='col-auto'>
              <button 
                type='button'
                className='btn sm flat counter' 
                onClick={onOpenOrderMenu} 
                disabled={count < 2}>
                <span className='hide-sm'>{t('SORT_BY')} {orderBy[orderByIndex].label}</span>
                <span className='show-sm'>{orderBy[orderByIndex].icon}</span>
              </button>
              <Menu 
                className='dropdown-menu'
                anchorEl={orderMenuAnchorEl} 
                open={Boolean(orderMenuAnchorEl)} 
                onClose={onCloseOrderMenu}>
                {orderByOptions}
              </Menu>
              <Tooltip title={t(desc ? 'ASCENDING' : 'DESCENDING')}>
                <span>
                  <button
                    type='button'
                    className={classnames('btn', 'sm', 'flat', 'counter', 'icon', desc ? 'desc' : 'asc')}
                    onClick={onToggleDesc}
                    disabled={count < 2}>
                    {icon.arrowDown}
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow : (
          <div
            className={classnames('shelf-row', 'books-per-row-4', coverview ? 'coverview' : 'stacked')}
            style={{ gridTemplateColumns: !count ? '1fr' : undefined, }}
          >
            {isOwner && (
              <Link to='/books/add'>
                <div className='book empty'>
                  <div className='cover'><div className='add'>+</div></div>
                  <div className='info'><b className='title'>{t('ACTION_ADD_BOOK')}</b></div>
                </div>
              </Link>
            )}
            {covers || (!isOwner && <EmptyState />)}
          </div>
        )}
        {pagination && (
          <PaginationControls 
            count={count} 
            fetch={fetchNext}
            limit={limit}
            page={page}
          />
        )}
      </div>
    </div>
  );
};
 
export default Shelf;