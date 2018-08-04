import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { booksRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';

export default class BooksDash extends React.Component {
 	state = {
    user: this.props.user,
    books: null,
    count: 0,
    desc: true,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'EDIT.lastEdit_num', label: 'Data ultima modifica'}, 
      { type: 'EDIT.lastEditByUid', label: 'Modificato da'},
      { type: 'EDIT.created_num', label: 'Data creazione'}, 
      { type: 'EDIT.createdByUid', label: 'Creato da'},  
      { type: 'title', label: 'Titolo'}
    ],
    orderByIndex: 0,
    page: 1,
    loading: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

  /* static getDerivedStateFromProps(props, state) {
    return null;
  } */ 

	componentDidMount() { 
    this._isMounted = true; 
    this.fetch();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { desc, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const bRef = booksRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching books');
    this.setState({ loading: true });
    
    booksRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ count: fullSnap.docs.length });
        let lastVisible = fullSnap.docs[startAt];
        //console.log({lastVisible, limit, direction, page});
        const ref = direction ? bRef.startAt(lastVisible) : bRef;
        ref.get().then(snap => {
          //console.log(snap);
          if (!snap.empty) {
            const books = [];
            snap.forEach(book => books.push({ ...book.data() }));
            this.setState(prevState => ({
              books: books,
              loading: false,
              page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ books: null, loading: false });
        });
      } else this.setState({ count: 0 });
    });
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));
  
  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onOpenLimitMenu = e => this.setState({ limitMenuAnchorEl: e.currentTarget });
  onChangeLimitBy = (e, i) => this.setState({ limitByIndex: i, limitMenuAnchorEl: null, page: 1 });
  onCloseLimitMenu = () => this.setState({ limitMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: id });
  
  onEdit = id => {
    console.log(`Editing ${id}`);
    this.setState({ redirectTo: id });
  }

  onLock = id => {
    console.log(`Locking ${id}`);
    this.props.openSnackbar('Libro bloccato', 'success');
  }

  onDelete = id => {
    console.log(`Deleting ${id}`);
    this.props.openSnackbar('Libro cancellato', 'success');
  }

	render() {
    const { books, count, desc,  limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const booksList = (books && (books.length > 0) &&
      books.map((book) => 
        <li key={book.bid} className="avatar-row">
          <div className="row">
            <div className="col-auto">
              <div className="mock-cover xs" style={{backgroundImage: `url(${book.covers[0]})`}}></div>
            </div>
            <Link to={`/book/${book.bid}`} className="col">
              {book.title}
            </Link>
            <Link to={`/author/${Object.keys(book.authors)[0]}`} className="col">
              {Object.keys(book.authors)[0]}
            </Link>
            <div className="col hide-md monotype" title={book.bid}>
              <CopyToClipboard openSnackbar={openSnackbar} text={book.bid}/>
            </div>
            <div className="col hide-md monotype" title={book.ISBN_13}>
              <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_13}/>
            </div>
            <div className="col hide-md monotype" title={book.ISBN_10}>
              <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_10} />
            </div>
            <Link to={`/dashboard/${book.EDIT.createdByUid}`} title={book.EDIT.createdByUid} className="col hide-sm">
              {book.EDIT.createdBy}
            </Link>
            <div className="col hide-sm col-lg-1">
              <div className="timestamp">{new Date(book.EDIT.created_num).toLocaleDateString()}</div>
            </div>
            <Link to={`/dashboard/${book.EDIT.lastEditByUid}`} title={book.EDIT.lastEditByUid} className="col">
              {book.EDIT.lastEditBy}
            </Link>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(book.EDIT.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon success" onClick={e => this.onView(book.bid)}>{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(book.bid)}>{icon.pencil()}</button>
              <button className="btn icon secondary" onClick={e => this.onLock(book.bid)}>{icon.lock()}</button>
              <button className="btn icon error" onClick={e => this.onDelete(book.bid)}>{icon.close()}</button>
            </div>
          </div>
        </li>
      )
    );

    const orderByOptions = orderBy.map((option, index) => (
      <MenuItem
        key={option.type}
        disabled={index === -1}
        selected={index === orderByIndex}
        onClick={event => this.onChangeOrderBy(event, index)}>
        {option.label}
      </MenuItem>
    ));

    const limitByOptions = limitBy.map((option, index) => (
      <MenuItem
        key={option}
        disabled={index === -1}
        selected={index === limitByIndex}
        onClick={event => this.onChangeLimitBy(event, index)}>
        {option}
      </MenuItem>
    ));

    if (redirectTo) return <Redirect to={`/book/${redirectTo}`} />

		return (
			<div className="container" id="booksDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${books ? books.length : 0} di ${count || 0} libri`}</span>
                <button className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
                <Popover 
                  open={Boolean(limitMenuAnchorEl)}
                  onClose={this.onCloseLimitMenu} 
                  anchorEl={limitMenuAnchorEl} 
                  anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  transformOrigin={{horizontal: 'left', vertical: 'top'}}>
                  <Menu 
                    anchorEl={limitMenuAnchorEl} 
                    open={Boolean(limitMenuAnchorEl)} 
                    onClose={this.onCloseLimitMenu}>
                    {limitByOptions}
                  </Menu>
                </Popover>
              </div>
              <div className="col-auto">
                <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                <Popover 
                  open={Boolean(orderMenuAnchorEl)}
                  onClose={this.onCloseOrderMenu} 
                  anchorEl={orderMenuAnchorEl} 
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  transformOrigin={{horizontal: 'right', vertical: 'top'}}>
                  <Menu 
                    anchorEl={orderMenuAnchorEl} 
                    open={Boolean(orderMenuAnchorEl)} 
                    onClose={this.onCloseOrderMenu}>
                    {orderByOptions}
                  </Menu>
                </Popover>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
              </div>
            </div>
          </div>
          {loading ? 
            <div className="loader"><CircularProgress /></div> 
          : !books ? 
            <div className="empty text-center">Nessun libro</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto"><div className="mock-cover xs hidden"></div></div>
                  <div className="col">Titolo</div>
                  <div className="col">Autore</div>
                  <div className="col hide-md">Bid</div>
                  <div className="col hide-md">ISBN-13</div>
                  <div className="col hide-md">ISBN-10</div>
                  <div className="col hide-sm">Creato da</div>
                  <div className="col hide-sm col-lg-1">Creato</div>
                  <div className="col">Modificato da</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Modificato</div>
                </div>
              </li>
              {booksList}
            </ul>
          }
          {count > limitBy[limitByIndex] &&
            <div className="info-row centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (count / limitBy[limitByIndex]) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
          }
        </div>
			</div>
		);
	}
}