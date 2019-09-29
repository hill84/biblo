import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Link } from 'react-router-dom';
import { userBooksRef, userRef } from '../config/firebase';
import { icon } from '../config/icons';
import { booksPerRow, handleFirestoreError, normURL } from '../config/shared';
import { funcType, numberType, stringType } from '../config/types';
import Cover from './cover';
import PaginationControls from './paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class Shelf extends React.Component {
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
    limit: numberType,
    openSnackbar: funcType.isRequired,
    shelf: stringType,
    luid: stringType,
    uid: stringType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.uid !== state.uid) { return { uid: props.uid }; }
    if (props.luid !== state.luid) { return { luid: props.luid }; }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchUserBooks();
    window.addEventListener('resize', this.updateLimit);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubUserBooksFullFetch && this.unsubUserBooksFullFetch();
    this.unsubUserBooksFetch && this.unsubUserBooksFetch();
    window.removeEventListener('resize', this.updateLimit);
  }

  componentDidUpdate(prevProps, prevState) {
    const { /* coverview,  */desc, filterByIndex, limit, luid, orderByIndex, uid } = this.state;
    if (/* coverview !== prevState.coverview ||  */desc !== prevState.desc || filterByIndex !== prevState.filterByIndex || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex || (luid && (luid !== prevState.luid)) || uid !== prevState.uid) {
      this.fetchUserBooks();
    } else if (!luid && (luid !== prevState.luid)) {
      if (this._isMounted) {
        this.setState({ isOwner: false });
      }
    }
  }

  updateLimit = () => this.setState({ limit: booksPerRow() * 2 - (this.props.luid === this.props.uid ? 1 : 0) });

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
          this.setState({ count: fullSnap.docs.length });
          const fullBooks = [];
          fullSnap.forEach(fullUserBook => fullBooks.push({ 
            readingState: { state_num: fullUserBook.data().readingState.state_num }, bid: fullUserBook.id 
          }));
          
          const lastVisible = fullSnap.docs[startAt];
          const ref = direction && lastVisible ? shelfRef.startAt(lastVisible) : shelfRef;
          this.unsubUserBooksFetch = ref.limit(limit).onSnapshot(snap => {
            this.setState({ loading: true });
            if (!snap.empty) {
              const items = [];
              snap.forEach(userBook => items.push({ ...userBook.data(), bid: userBook.id }));
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
                    const cid = challenges[0].cid;
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
            } else this.setState(empty);
          });
        } else this.setState(empty);
      });
    } else console.warn(`No uid: ${uid}`);
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onChangeFilterBy = (e, i) => this.setState({ filterByIndex: i, filterMenuAnchorEl: null, page: 1 });

  onChangeSelect = key => e => {
		this.setState({ 
      success: false, changes: true, 
      user: { ...this.state.user, [key]: e.target.value },
      errors: { ...this.state.errors, [key]: null } 
    });
	};

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview/* , limit: !prevState.coverview ? booksPerRow() * 2 - 1 : 10 */ }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onOpenFilterMenu = e => this.setState({ filterMenuAnchorEl: e.currentTarget });
  onCloseFilterMenu = () => this.setState({ filterMenuAnchorEl: null });

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
      <React.Fragment>
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
                    <React.Fragment>
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
                    </React.Fragment>
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
              <div className={`shelf-row ${coverview ? 'coverview' : 'stacked'}`} style={{ gridTemplateColumns: !count && '1fr' }}>
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
      </React.Fragment>
    );
  }
}