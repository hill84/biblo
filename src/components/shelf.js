import { Tooltip } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { userBooksRef, userRef } from '../config/firebase';
import icon from '../config/icons';
import { userBookTypes } from '../config/lists';
import { booksPerRow, handleFirestoreError, normURL } from '../config/shared';
import { stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import Cover from './cover';
import PaginationControls from './paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

const filterBy = userBookTypes;

const orderBy = [ 
  { type: 'added_num', label: 'Data aggiunta', icon: icon.calendar }, 
  { type: 'title', label: 'Titolo', icon: icon.formatTitle }, 
  { type: 'rating_num', label: 'Valutazione', icon: icon.star }, 
  { type: 'authors', label: 'Autore', icon: icon.accountEdit }
];

const unsub = {
  userBooksFetch: null,
  userBooksFullFetch: null
};

const pagination = true;

const Shelf = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { uid } = props;
  const luid = user && user.uid;
  const [coverview, setCoverview] = useState(true);
  const [desc, setDesc] = useState(true);
  const [filterByIndex, setFilterByIndex] = useState(0);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [isOwner, setIsOwner] = useState(luid === uid);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderByIndex, setOrderByIndex] = useState(0);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const shelf = props.shelf || 'bookInShelf';
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const is = useRef(true);

  const updateLimit = useCallback(() => {
    if (is.current && uid) {
      setLimit(booksPerRow() * 2 - (luid === uid ? 1 : 0));
    }
  }, [luid, uid]);

  useEffect(() => {  
    window.addEventListener('resize', updateLimit);
    
    return () => {
      window.removeEventListener('resize', updateLimit);
    }
  }, [updateLimit]);

  useEffect(() => {
    updateLimit();
  }, [updateLimit]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const fetchUserBooks = useCallback(e => {
    const direction = e && e.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const startAt = direction ? prev ? ((page - 1) * limit) - limit : page * limit : 0;
    const baseRef = userBooksRef(uid).where(shelf, '==', true).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
    const shelfRef = filterByIndex !== 0 ? baseRef.where('readingState.state_num', '==', filterByIndex) : baseRef;
    const setEmptyState = err => {
      setIsOwner(luid === uid);
      updateLimit();
      setCount(0);
      setItems([]);
      setLoading(false);
      setPage(1);
      if (err) openSnackbar(handleFirestoreError(err), 'error');
    };

    unsub.userBooksFullFetch = shelfRef.onSnapshot(fullSnap => {
      if (!fullSnap.empty) {
        if (is.current) setCount(fullSnap.docs.length);

        const fullBooks = [];

        fullSnap.forEach(fullUserBook => fullBooks.push({ 
          readingState: { state_num: fullUserBook.data().readingState.state_num }, 
          bid: fullUserBook.id 
        }));
        
        const lastVisible = fullSnap.docs[startAt];
        const ref = direction && lastVisible ? shelfRef.startAt(lastVisible) : shelfRef;

        unsub.userBooksFetch = ref.limit(limit).onSnapshot(snap => {
          if (is.current) setLoading(true);

          if (!snap.empty) {
            const items = [];
            snap.forEach(userBook => items.push({ ...userBook.data(), bid: userBook.id }));

            if (is.current) {
              setIsOwner(luid === uid);
              setLimit(booksPerRow() * 2 - (luid === uid ? 1 : 0));
              setItems(items);
              setLoading(false);
              setPage(page => (direction ? prev ? page > 1 ? page - 1 : 1 : (page * limit) > count ? page : page + 1 : 1));
              
              // GET CHALLENGES
              luid === uid && userRef(luid).collection('challenges').get().then(snap => {
                if (!snap.empty) {
                  const challenges = [];
                  snap.forEach(doc => challenges.push(doc.data()));
                  // UPDATE READING STATE OF CHALLENGE BOOKS 
                  const { cid } = challenges[0];
                  const cBooks = { ...challenges[0].books };
                  Object.keys(cBooks).filter(bid => !cBooks[bid]).forEach(bid => {
                    fullBooks.filter(item => item.bid === bid && item.readingState.state_num === 3).forEach(item => {
                      cBooks[item.bid] = true;
                    });
                  });
                  Object.keys(cBooks).filter(bid => cBooks[bid]).forEach(bid => {
                    fullBooks.filter(item => item.bid === bid && item.readingState.state_num !== 3).forEach(item => {
                      cBooks[item.bid] = false;
                    });
                  });
                  if (JSON.stringify(cBooks) !== JSON.stringify(challenges[0].books)) {
                    console.warn(cBooks);
                    userRef(luid).collection('challenges').doc(cid).update({ 
                      books: cBooks, 
                      completed_num: Object.keys(cBooks).filter(bid => !cBooks[bid]).length === 0 ? Date.now() : 0
                    }).then().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
                  } // else console.log('No challenge books to update');
                }
              }).catch(err => setEmptyState(err));
            }
          } else if (is.current) setEmptyState();
        });
      } else if (is.current) setEmptyState();
    });
    // eslint-disable-next-line
  }, [desc, filterByIndex, limit, luid, openSnackbar, orderByIndex, shelf, uid]);

  useEffect(() => {
    if (uid && limit) fetchUserBooks();
  }, [fetchUserBooks, limit, luid, uid]);

  useEffect(() => () => {
    is.current = false;
    unsub.userBooksFetch && unsub.userBooksFetch();
    unsub.userBooksFullFetch && unsub.userBooksFullFetch();
  }, []);

  const onChangeOrderBy = (e, i) => {
    if (is.current) {
      setOrderByIndex(i);
      setOrderMenuAnchorEl(null);
      setPage(1);
    }
  };

  const onChangeFilterBy = useCallback((e, i) => {
    if (is.current) {
      setFilterByIndex(i);
      setFilterMenuAnchorEl(null);
      setPage(1);
    }
  }, []);

  const onToggleDesc = () => is.current && setDesc(!desc);

  const onToggleView = () => is.current && setCoverview(!coverview);

  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);
  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);

  const onOpenFilterMenu = e => {
    e.persist();
    if (is.current) setFilterMenuAnchorEl(e.currentTarget);
  }
  const onCloseFilterMenu = () => setFilterMenuAnchorEl(null);

  const covers = useMemo(() => items && items.length > 0 && items.map((book, i) => (
    <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}><Cover book={book} index={i} rating={shelf === 'bookInShelf'} /></Link>
  )), [items, shelf]);

  const filterByOptions = useMemo(() => filterBy.map((option, i) => (
    <MenuItem
      key={i}
      disabled={i === -1}
      selected={i === filterByIndex}
      onClick={e => onChangeFilterBy(e, i)}>
      {option}
    </MenuItem>
  )), [filterByIndex, onChangeFilterBy]);

  const orderByOptions = useMemo(() => orderBy.map((option, i) => (
    <MenuItem
      key={option.type}
      className={shelf !== 'bookInShelf' && option.type === 'rating_num' ? 'hide-always' : ''}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={e => onChangeOrderBy(e, i)}>
      <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
      <Typography variant="inherit">{orderBy[i].label}</Typography>
    </MenuItem>
  )), [orderByIndex, shelf]);

  const EmptyState = () => (
    <div className="info-row empty text-center">
      Nessuna libro <span className="hide-xs">trovato</span>
    </div>
  );

  return (
    <>
      <div className="shelf">
        <div className="collection hoverable-items">
          <div className="head nav">
            <div className="row">
              <div className="col">
                <button 
                  type="button"
                  className="btn sm flat counter icon" 
                  disabled={!count}
                  title={coverview ? 'Stack view' : 'Cover view'} 
                  onClick={onToggleView}>
                  {coverview ? icon.viewSequential : icon.viewGrid}
                </button>
                {shelf === 'bookInShelf' && (
                  <>
                    <button 
                      type="button"
                      className="btn sm flat counter" 
                      // disabled={!count}
                      onClick={onOpenFilterMenu}>
                      {filterBy[filterByIndex]}
                    </button>
                    <Menu 
                      className="dropdown-menu"
                      anchorEl={filterMenuAnchorEl} 
                      open={Boolean(filterMenuAnchorEl)} 
                      onClose={onCloseFilterMenu}>
                      {filterByOptions}
                    </Menu>
                  </>
                )}
                <span className="counter last hide-sm">{count !== items.length ? `${items.length} di ` : ''}{count} libr{count !== 1 ? 'i' : 'o'}</span>
              </div>
              <div className="col-auto">
                <button 
                  type="button"
                  className="btn sm flat counter" 
                  onClick={onOpenOrderMenu} 
                  disabled={count < 2}>
                  <span className="hide-sm">Ordina per {orderBy[orderByIndex].label}</span>
                  <span className="show-sm">{orderBy[orderByIndex].icon}</span>
                </button>
                <Menu 
                  className="dropdown-menu"
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
                <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                  <span>
                    <button
                      type="button"
                      className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`}
                      onClick={onToggleDesc}
                      disabled={count < 2}>
                      {icon.arrowDown}
                    </button>
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
          {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow :
            <div className={`shelf-row ${coverview ? 'coverview' : 'stacked'}`} style={{ gridTemplateColumns: !count && '1fr', }}>
              {isOwner && (
                <Link to="/books/add">
                  <div className="book empty">
                    <div className="cover"><div className="add">+</div></div>
                    <div className="info"><b className="title">Aggiungi libro</b></div>
                  </div>
                </Link>
              )}
              {covers || (!isOwner && <EmptyState />)}
            </div>
          }
          {pagination && (
            <PaginationControls 
              count={count} 
              fetch={fetchUserBooks}
              limit={limit}
              page={page}
            />
          )}
        </div>
      </div>
    </>
  );
}

Shelf.propTypes = {
  shelf: stringType,
  uid: stringType.isRequired
}

Shelf.defaultProps = {
  shelf: null
}
 
export default Shelf;