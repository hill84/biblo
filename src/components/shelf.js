import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import React from 'react';
import { Link } from 'react-router-dom';
import { userBooksRef } from '../config/firebase';
import { icon } from '../config/icons';
import { numberType, stringType } from '../config/types';
import { booksPerRow } from '../config/shared';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class Shelf extends React.Component {
  state = {
    luid: this.props.luid,
    uid: this.props.uid,
    isOwner: this.props.luid === this.props.uid,
    shelf: this.props.shelf || 'bookInShelf',
    anchorEl: null,
    isOpenOrderMenu: false,
    limit: booksPerRow() * 2 - 1,
    orderBy: { type: 'added_num', label: 'Data aggiunta' },
    coverview: true,
    desc: true,
    loading: true,
    userBooks: [],
    userBooksCount : 0,
    pagination: true,
    page: 1,
    lastVisible: null
  }

  static propTypes = {
    limit: numberType,
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
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { coverview, desc, luid, orderBy, uid } = this.state;
    if (this._isMounted) {
      if (coverview !== prevState.coverview || desc !== prevState.desc || orderBy !== prevState.orderBy || (luid && (luid !== prevState.luid)) || uid !== prevState.uid) {
        this.fetchUserBooks();
      } else if (!luid && (luid !== prevState.luid)) {
        this.setState({ isOwner: false });
      }
    }
  }

  fetchUserBooks = direction => {
    const { desc, limit, luid, orderBy, page, shelf, uid } = this.state;
    if (uid) {
      const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
      const shelfRef = userBooksRef(uid).where(shelf, '==', true).orderBy(orderBy.type, desc ? 'desc' : 'asc');
      const empty = { 
        isOwner: luid === uid,
        userBooksCount: 0, 
        userBooks: [],
        loading: false,
        page: 1
      };
  
      shelfRef.onSnapshot(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ userBooksCount: fullSnap.docs.length });
          let lastVisible = fullSnap.docs[startAt];
          const ref = direction ? shelfRef.startAt(lastVisible) : shelfRef;
          ref.limit(limit).onSnapshot(snap => {
            this.setState({ loading: true });
            if (!snap.empty) {
              const userBooks = [];
              snap.forEach(userBook => userBooks.push({ ...userBook.data(), bid: userBook.id }));
              this.setState(prevState => ({ 
                isOwner: luid === uid,
                userBooks,
                loading: false,
                page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.userBooksCount) ? prevState.page : prevState.page + 1 : 1
              }));
            } else this.setState(empty);
          });
        } else this.setState(empty);
      });
    } else console.warn(`No uid: ${uid}`);
  }

  onChangeOrder = (event, value) => this.setState({ orderBy: value, isOpenOrderMenu: false, page: 1 });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview/* , limit: !prevState.coverview ? booksPerRow() * 2 - 1 : 10 */ }));

  onToggleOrderMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
    this.setState(prevState => ({ isOpenOrderMenu: !prevState.isOpenOrderMenu }));
  }

  render() {
    const { coverview, desc, isOpenOrderMenu, isOwner, limit, loading, orderBy, page, pagination, shelf, userBooks, userBooksCount } = this.state;
    const covers = userBooks && userBooks.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={index} rating={shelf === 'bookInShelf'} /></Link>);

    return (
      <div ref="shelfComponent">
        <div className="shelf">
          <div className="collection hoverable-items">
            <div className="head nav">
              <div className="row">
                <div className="col">
                  <button 
                    className={`btn sm flat counter`} 
                    title={coverview ? 'Stack view' : 'Cover view'} 
                    onClick={this.onToggleView}>
                    {coverview ? icon.viewSequential() : icon.viewGrid()}
                  </button>
                  <span className="counter hide-sm">{userBooksCount !== userBooks.length ? `${userBooks.length} di ` : ''}{userBooksCount} libri</span>
                </div>
                <div className="col-auto">
                  <span className="counter last hide-xs">Ordina per</span>
                  <button className="btn sm flat counter" onClick={this.onToggleOrderMenu}>{orderBy.label}</button>
                  <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                  <Popover 
                    open={isOpenOrderMenu} 
                    onRequestClose={this.onToggleOrderMenu} 
                    anchorEl={this.state.anchorEl} 
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                    <Menu onChange={this.onChangeOrder}>
                      <MenuItem value={{type: 'added_num', label: 'Data aggiunta'}} primaryText="Data aggiunta" />
                      <MenuItem value={{type: 'title', label: 'Titolo'}} primaryText="Titolo" />
                      {shelf === 'bookInShelf' && <MenuItem value={{type: 'rating_num', label: 'Valutazione'}} primaryText="Valutazione" />}
                      <MenuItem value={{type: 'authors', label: 'Autore'}} primaryText="Autore" />
                    </Menu>
                  </Popover>
                </div>
              </div>
            </div>
            {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow :
              <div className={`shelf-row ${coverview ? 'coverview' : 'stacked'}`}>
                {isOwner &&
                  <Link to="/books/add">
                    <div className="book empty">
                      <div className="cover"><div className="add">+</div></div>
                      <div className="info"><b className="title">Aggiungi libro</b></div>
                    </div>
                  </Link>
                }
                {covers}
              </div>
            }
            {pagination && userBooksCount > limit &&
              <div className="info-row footer centered pagination">
                <button 
                  disabled={page === 1 && 'disabled'} 
                  className="btn sm clear prepend" 
                  onClick={() => this.fetchUserBooks('prev')} title="precedente">
                  {icon.chevronLeft()}
                </button>

                <button 
                  disabled={page > (userBooksCount / limit) && 'disabled'} 
                  className="btn sm clear append" 
                  onClick={() => this.fetchUserBooks('next')} title="successivo">
                  {icon.chevronRight()}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}