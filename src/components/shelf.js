import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { userBooksRef,  userRef } from '../config/firebase';
import icon from '../config/icons';
import { booksPerRow, handleFirestoreError, normURL } from '../config/shared';
import { funcType, /* numberType, */ stringType } from '../config/types';
import Cover from './cover';
import PaginationControls from './paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

const Shelf = props => {
  const [state, setState] = useState({
    luid: props.luid,
    uid: props.uid,
    coverview: true,
    desc: true,
    filterBy: [ 'Tutti', 'Non iniziati', 'In lettura', 'Finiti', 'Abbandonati', 'Da consulatazione'],
    filterByIndex: 0,
    filterMenuAnchorEl: null,
    isOwner: props.luid === props.uid,
    limit: booksPerRow() * 2 - (props.luid === props.uid ? 1 : 0),
    loading: true,
    orderBy: [ 
      { type: 'added_num', label: 'Data aggiunta', icon: icon.calendar() }, 
      { type: 'title', label: 'Titolo', icon: icon.formatTitle() }, 
      { type: 'rating_num', label: 'Valutazione', icon: icon.star() }, 
      { type: 'authors', label: 'Autore', icon: icon.accountEdit() }
    ],
    orderByIndex: 0,
    orderMenuAnchorEl: null,
    shelf: props.shelf || 'bookInShelf',
    items: [],
    count : 0,
    pagination: true,
    page: 1
  });

  // props = limit, openSnackbar, shelf, luid, uid

  const is = useRef(true);
  const sub = useRef();
  const { openSnackbar } = props;
  const { count, coverview, desc, filterBy, filterByIndex, filterMenuAnchorEl, isOwner, items, limit, loading, luid, orderBy, orderByIndex, orderMenuAnchorEl, pagination, page, shelf, uid } = state;

  const updateLimit = useCallback(() => {
    if (is.current) setState(prevState => ({ ...prevState, limit: booksPerRow() * 2 - (luid === uid ? 1 : 0) }));
  }, [luid, uid]);

  const fetchUserBooks = useCallback(e => {
    const direction = e && e.currentTarget.dataset.direction;

    if (uid) {
      const prev = direction === 'prev';
      const startAt = direction ? prev ? ((page - 1) * limit) - limit : page * limit : 0;
      const baseRef = userBooksRef(uid).where(shelf, '==', true).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
      const shelfRef = filterByIndex !== 0 ? baseRef.where('readingState.state_num', '==', filterByIndex) : baseRef;
      const empty = {
        isOwner: luid === uid,
        count: 0, 
        items: [],
        loading: false,
        page: 1
      };
  
      sub.current.userBooksFullFetch = shelfRef.onSnapshot(fullSnap => {
        if (!fullSnap.empty) { 
          if (is.current) setState(prevState => ({ ...prevState, count: fullSnap.docs.length }));
          const fullBooks = [];
          fullSnap.forEach(fullUserBook => fullBooks.push({ 
            readingState: { state_num: fullUserBook.data().readingState.state_num }, bid: fullUserBook.id 
          }));
          
          const lastVisible = fullSnap.docs[startAt];
          const ref = direction && lastVisible ? shelfRef.startAt(lastVisible) : shelfRef;
          sub.current.userBooksFetch = ref.limit(limit).onSnapshot(snap => {
            if (is.current) setState(prevState => ({ ...prevState, loading: true }));
            if (!snap.empty) {
              const items = [];
              snap.forEach(userBook => items.push({ ...userBook.data(), bid: userBook.id }));
              if (is.current) {
                setState(prevState => ({ 
                  ...prevState,
                  isOwner: luid === uid,
                  items,
                  loading: false,
                  page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : (prevState.page * prevState.limit) > prevState.count ? prevState.page : prevState.page + 1 : 1
                }));
                
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
                        completed_num: Object.keys(cBooks).filter(bid => !cBooks[bid]).length === 0 ? Number((new Date()).getTime()) : 0
                      }).then().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
                    } // else console.log('No challenge books to update');
                  }
                }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
              }
            } else if (is.current) setState(prevState => ({ ...prevState, ...empty}));
          });
        } else if (is.current) setState(prevState => ({ ...prevState, ...empty}));
      });
    } else console.warn(`No uid: ${uid}`);
  }, [desc, filterByIndex, limit, luid, openSnackbar, orderBy, orderByIndex, page, shelf, uid]);

  useEffect(() => {
    window.addEventListener('resize', updateLimit);

    return () => {
      window.removeEventListener('resize', updateLimit);
    };
  }, [updateLimit]);

  useEffect(() => {
    fetchUserBooks();
    const unsub = sub.current;

    return () => {
      if (unsub) {
        unsub.userBooksFetch && unsub.userBooksFetch();
        unsub.userBooksFullFetch && unsub.userBooksFullFetch();
      }
    }
  }, [fetchUserBooks]);

  useEffect(() => {
    if (!luid) {
      setState(prevState => ({ ...prevState, isOwner: false }));
    }
  }, [luid]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onChangeOrderBy = (e, i) => {
    e.persist();
    if (is.current) {
      setState(prevState => ({ ...prevState, orderByIndex: i, orderMenuAnchorEl: null, page: 1 }));
    }
  }

  const onChangeFilterBy = (e, i) => {
    e.persist();
    if (is.current) {
      setState(prevState => ({ ...prevState, filterByIndex: i, filterMenuAnchorEl: null, page: 1 }));
    }
  };

  /* const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (is.current) {
      setState(prevState => ({ 
        ...prevState,
        // success: false, changes: true, 
        user: { ...prevState.user, [name]: value },
        errors: { ...prevState.errors, [name]: null } 
      }));
    }
	}; */

  const onToggleDesc = () => {
    if (is.current) setState(prevState => ({ ...prevState, desc: !prevState.desc }));
  }

  const onToggleView = () => {
    if (is.current) setState(prevState => ({ ...prevState, coverview: !prevState.coverview/* , limit: !prevState.coverview ? booksPerRow() * 2 - 1 : 10 */ }));
  }

  const onOpenOrderMenu = e => {
    e.persist();
    if (is.current) setState(prevState => ({ ...prevState, orderMenuAnchorEl: e.currentTarget }));
  }

  const onCloseOrderMenu = () => {
    if (is.current) setState(prevState => ({ ...prevState, orderMenuAnchorEl: null }));
  }

  const onOpenFilterMenu = e => {
    e.persist();
    if (is.current) setState(prevState => ({ ...prevState, filterMenuAnchorEl: e.currentTarget }));
  }

  const onCloseFilterMenu = () => {
    if (is.current) setState(prevState => ({ ...prevState, filterMenuAnchorEl: null }));
  }

  const covers = items && items.length > 0 && items.map((book, i) => (
    <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}><Cover book={book} index={i} rating={shelf === 'bookInShelf'} /></Link>
  ));

  const filterByOptions = filterBy.map((option, i) => (
    <MenuItem
      key={i}
      disabled={i === -1}
      selected={i === filterByIndex}
      onClick={e => onChangeFilterBy(e, i)}>
      {option}
    </MenuItem>
  ));

  const orderByOptions = orderBy.map((option, i) => (
    <MenuItem
      key={option.type}
      className={shelf !== 'bookInShelf' && option.type === 'rating_num' ? 'hide-always' : ''}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={e => onChangeOrderBy(e, i)}>
      <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
      <Typography variant="inherit">{orderBy[i].label}</Typography>
    </MenuItem>
  ));
  
  const EmptyState = () => (
    <div className="info-row empty text-center">
      Nessuna libro <span className="hide-xs">trovato</span>
    </div>
  );

  return (
    <>
      <div className="shelf" ref={is}>
        <div className="collection hoverable-items" ref={sub}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <button 
                  type="button"
                  className="btn sm flat counter icon" 
                  disabled={!count}
                  title={coverview ? 'Stack view' : 'Cover view'} 
                  onClick={onToggleView}>
                  {coverview ? icon.viewSequential() : icon.viewGrid()}
                </button>
                {shelf === 'bookInShelf' && count > 0 && 
                  <>
                    <button 
                      type="button"
                      className="btn sm flat counter" 
                      disabled={!count}
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
                }
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
                <button 
                  type="button"
                  className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} 
                  title={desc ? 'Ascendente' : 'Discendente'} 
                  onClick={onToggleDesc} 
                  disabled={count < 2}>
                  {icon.arrowDown()}
                </button>
              </div>
            </div>
          </div>
          {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow :
            <div className={`shelf-row ${coverview ? 'coverview' : 'stacked'}`} style={{ gridTemplateColumns: !count && '1fr', }}>
              {isOwner &&
                <Link to="/books/add">
                  <div className="book empty">
                    <div className="cover"><div className="add">+</div></div>
                    <div className="info"><b className="title">Aggiungi libro</b></div>
                  </div>
                </Link>
              }
              {covers || (!isOwner && <EmptyState />)}
            </div>
          }
          {pagination && 
            <PaginationControls 
              count={count} 
              fetch={fetchUserBooks}
              limit={limit}
              page={page}
            />
          }
        </div>
      </div>
    </>
  );
}

Shelf.propTypes = {
  // limit: numberType,
  openSnackbar: funcType.isRequired,
  shelf: stringType,
  luid: stringType,
  uid: stringType.isRequired
}

Shelf.defaultProps = {
  // limit: null,
  shelf: null,
  luid: null
}
 
export default Shelf;

/* export default class Shelf extends Component {
  state = {
    luid: this.props.luid,
    uid: this.props.uid,
    coverview: true,
    desc: true,
    filterBy: [ 'Tutti', 'Non iniziati', 'In lettura', 'Finiti', 'Abbandonati', 'Da consulatazione'],
    filterByIndex: 0,
    filterMenuAnchorEl: null,
    isOwner: this.props.luid === this.props.uid,
    limit: booksPerRow() * 2 - (this.props.luid === this.props.uid ? 1 : 0),
    loading: true,
    orderBy: [ 
      { type: 'added_num', label: 'Data aggiunta', icon: icon.calendar() }, 
      { type: 'title', label: 'Titolo', icon: icon.formatTitle() }, 
      { type: 'rating_num', label: 'Valutazione', icon: icon.star() }, 
      { type: 'authors', label: 'Autore', icon: icon.accountEdit() }
    ],
    orderByIndex: 0,
    orderMenuAnchorEl: null,
    shelf: this.props.shelf || 'bookInShelf',
    items: [],
    count : 0,
    pagination: true,
    page: 1
  }

  static propTypes = {
    // limit: numberType,
    openSnackbar: funcType.isRequired,
    shelf: stringType,
    luid: stringType,
    uid: stringType.isRequired
  }

  static defaultProps = {
    // limit: null,
    shelf: null,
    luid: null
  }

  static getDerivedStateFromProps(props, state) {
    if (props.uid !== state.uid) { return { uid: props.uid }; }
    if (props.luid !== state.luid) { return { luid: props.luid }; }
    return null;
  }

  componentDidMount() {
    is.current = true;
    this.fetchUserBooks();
    window.addEventListener('resize', this.updateLimit);
  }

  componentDidUpdate(prevProps, prevState) {
    const { desc, filterByIndex, limit, luid, orderByIndex, uid } = this.state;
    if (desc !== prevState.desc || filterByIndex !== prevState.filterByIndex || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex || (luid && (luid !== prevState.luid)) || uid !== prevState.uid) {
      this.fetchUserBooks();
    } else if (!luid && (luid !== prevState.luid)) {
      if (is.current) {
        this.setState({ isOwner: false });
      }
    }
  }

  componentWillUnmount() {
    is.current = false;
    this.unsubUserBooksFullFetch && this.unsubUserBooksFullFetch();
    this.unsubUserBooksFetch && this.unsubUserBooksFetch();
    window.removeEventListener('resize', this.updateLimit);
  }

  updateLimit = () => is.current && this.setState({ limit: booksPerRow() * 2 - (this.props.luid === this.props.uid ? 1 : 0) });

  fetchUserBooks = e => {
    const { desc, filterByIndex, limit, luid, orderBy, orderByIndex, page, shelf, uid } = this.state;
    const { openSnackbar } = this.props;
    const direction = e && e.currentTarget.dataset.direction;

    if (uid) {
      const prev = direction === 'prev';
      const startAt = direction ? prev ? ((page - 1) * limit) - limit : page * limit : 0;
      const baseRef = userBooksRef(uid).where(shelf, '==', true).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
      const shelfRef = filterByIndex !== 0 ? baseRef.where('readingState.state_num', '==', filterByIndex) : baseRef;
      const empty = { 
        isOwner: luid === uid,
        count: 0, 
        items: [],
        loading: false,
        page: 1
      };
  
      this.unsubUserBooksFullFetch = shelfRef.onSnapshot(fullSnap => {
        if (!fullSnap.empty) { 
          if (is.current) this.setState({ count: fullSnap.docs.length });
          const fullBooks = [];
          fullSnap.forEach(fullUserBook => fullBooks.push({ 
            readingState: { state_num: fullUserBook.data().readingState.state_num }, bid: fullUserBook.id 
          }));
          
          const lastVisible = fullSnap.docs[startAt];
          const ref = direction && lastVisible ? shelfRef.startAt(lastVisible) : shelfRef;
          this.unsubUserBooksFetch = ref.limit(limit).onSnapshot(snap => {
            if (is.current) this.setState({ loading: true });
            if (!snap.empty) {
              const items = [];
              snap.forEach(userBook => items.push({ ...userBook.data(), bid: userBook.id }));
              if (is.current) {
                this.setState(prevState => ({ 
                  isOwner: luid === uid,
                  items,
                  loading: false,
                  page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : (prevState.page * prevState.limit) > prevState.count ? prevState.page : prevState.page + 1 : 1
                }), () => {
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
                          completed_num: Object.keys(cBooks).filter(bid => !cBooks[bid]).length === 0 ? Number((new Date()).getTime()) : 0
                        }).then().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
                      } // else console.log('No challenge books to update');
                    }
                  }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
                });
              }
            } else if (is.current) this.setState(empty);
          });
        } else if (is.current) this.setState(empty);
      });
    } else console.warn(`No uid: ${uid}`);
  }

  onChangeOrderBy = (e, i) => is.current && this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onChangeFilterBy = (e, i) => is.current && this.setState({ filterByIndex: i, filterMenuAnchorEl: null, page: 1 });

  onChangeSelect = name => e => {
    const { value } = e.target;
    
    if (is.current) {
      this.setState(prevState => ({ 
        // success: false, changes: true, 
        user: { ...prevState.user, [name]: value },
        errors: { ...prevState.errors, [name]: null } 
      }));
    }
	};

  onToggleDesc = () => is.current && this.setState(prevState => ({ desc: !prevState.desc }));

  onToggleView = () => is.current && this.setState(prevState => ({ coverview: !prevState.coverview }));

  onOpenOrderMenu = e => is.current && this.setState({ orderMenuAnchorEl: e.currentTarget });
  onCloseOrderMenu = () => is.current && this.setState({ orderMenuAnchorEl: null });

  onOpenFilterMenu = e => is.current && this.setState({ filterMenuAnchorEl: e.currentTarget });
  onCloseFilterMenu = () => is.current && this.setState({ filterMenuAnchorEl: null });

  render() {
    const { coverview, desc, filterBy, filterByIndex, filterMenuAnchorEl, isOwner, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, pagination, shelf, items, count } = this.state;
    const covers = items && items.length > 0 && items.map((book, i) => (
      <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}><Cover book={book} index={i} rating={shelf === 'bookInShelf'} /></Link>
    ));
    const filterByOptions = filterBy.map((option, i) => (
      <MenuItem
        key={i}
        disabled={i === -1}
        selected={i === filterByIndex}
        onClick={e => this.onChangeFilterBy(e, i)}>
        {option}
      </MenuItem>
    ));
    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        className={shelf !== 'bookInShelf' && option.type === 'rating_num' ? 'hide-always' : ''}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
        <Typography variant="inherit">{orderBy[i].label}</Typography>
      </MenuItem>
    ));
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
                    onClick={this.onToggleView}>
                    {coverview ? icon.viewSequential() : icon.viewGrid()}
                  </button>
                  {shelf === 'bookInShelf' && count > 0 && 
                    <>
                      <button 
                        type="button"
                        className="btn sm flat counter" 
                        disabled={!count}
                        onClick={this.onOpenFilterMenu}>
                        {filterBy[filterByIndex]}
                      </button>
                      <Menu 
                        className="dropdown-menu"
                        anchorEl={filterMenuAnchorEl} 
                        open={Boolean(filterMenuAnchorEl)} 
                        onClose={this.onCloseFilterMenu}>
                        {filterByOptions}
                      </Menu>
                    </>
                  }
                  <span className="counter last hide-sm">{count !== items.length ? `${items.length} di ` : ''}{count} libr{count !== 1 ? 'i' : 'o'}</span>
                </div>
                <div className="col-auto">
                  <button 
                    type="button"
                    className="btn sm flat counter" 
                    onClick={this.onOpenOrderMenu} 
                    disabled={count < 2}>
                    <span className="hide-sm">Ordina per {orderBy[orderByIndex].label}</span>
                    <span className="show-sm">{orderBy[orderByIndex].icon}</span>
                  </button>
                  <Menu 
                    className="dropdown-menu"
                    anchorEl={orderMenuAnchorEl} 
                    open={Boolean(orderMenuAnchorEl)} 
                    onClose={this.onCloseOrderMenu}>
                    {orderByOptions}
                  </Menu>
                  <button 
                    type="button"
                    className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} 
                    title={desc ? 'Ascendente' : 'Discendente'} 
                    onClick={this.onToggleDesc} 
                    disabled={count < 2}>
                    {icon.arrowDown()}
                  </button>
                </div>
              </div>
            </div>
            {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow :
              <div className={`shelf-row ${coverview ? 'coverview' : 'stacked'}`} style={{ gridTemplateColumns: !count && '1fr', }}>
                {isOwner &&
                  <Link to="/books/add">
                    <div className="book empty">
                      <div className="cover"><div className="add">+</div></div>
                      <div className="info"><b className="title">Aggiungi libro</b></div>
                    </div>
                  </Link>
                }
                {covers || (!isOwner && <EmptyState />)}
              </div>
            }
            {pagination && 
              <PaginationControls 
                count={count} 
                fetch={this.fetchUserBooks}
                limit={limit}
                page={page}
              />
            }
          </div>
        </div>
      </>
    );
  }
} */