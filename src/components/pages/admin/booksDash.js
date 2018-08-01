import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { booksRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import { timeSince } from '../../../config/shared';

export default class BooksDash extends React.Component {
 	state = {
    user: this.props.user,
    books: null,
    booksCount: 0,
    desc: true,
    limit: 50,
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
    loadingBooks: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

 static getDerivedStateFromProps(props, state) {
    return null;
  } 

	componentDidMount() { 
    this._isMounted = true; 
    this.fetchBooks();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetchBooks();
      }
    }
  }
    
  fetchBooks = direction => {
    const { desc, limit, orderBy, orderByIndex, page } = this.state;
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const bRef = booksRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching books');
    this.setState({ loadingBooks: true });
    
    booksRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ booksCount: fullSnap.docs.length });
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
              loadingBooks: false,
              page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ books: null, loadingBooks: false });
        });
      } else this.setState({ booksCount: 0 });
    });
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onEdit = () => {
    console.log('Editing..');
    this.props.openSnackbar('Modifiche salvate', 'success');
  }

  onDelete = () => {
    console.log('Deleting..');
    this.props.openSnackbar('Libro cancellato', 'success');
  }

	render() {
    const { books, booksCount, desc, limit, loadingBooks, orderBy, orderByIndex, orderMenuAnchorEl, page } = this.state;
    const { openSnackbar } = this.props;

    const booksList = (books && (books.length > 0) &&
      books.map((book) => 
        <li key={book.bid} className="avatar-row">
          <div className="row">
            <Link to={`/book/${book.bid}`} className="col">
              {book.title}
            </Link>
            <Link to={`/author/${Object.keys(book.authors)[0]}`} className="col">
              {Object.keys(book.authors)[0]}
            </Link>
            <div className="col monotype">
              <small><CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_13}/></small>
            </div>
            <div className="col monotype">
              <small><CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_10}/></small>
            </div>
            <Link to={`/dashboard/${book.EDIT.createdByUid}`} title={book.EDIT.createdByUid} className="col">
              {book.EDIT.createdBy}
            </Link>
            <div className="col col-sm-2 col-lg-1">
              <div className="timestamp">{new Date(book.EDIT.created_num).toLocaleDateString()}</div>
            </div>
            <Link to={`/dashboard/${book.EDIT.lastEditByUid}`} title={book.EDIT.lastEditByUid} className="col">
              {book.EDIT.lastEditBy}
            </Link>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(book.EDIT.lastEdit_num)}</div>
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

		return (
			<div className="container" id="booksDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${books ? books.length : 0} di ${booksCount || 0} libri`}</span>
              </div>
              <div className="col-auto">
                <span className="counter last hide-xs">Ordina per</span>
                <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}>{orderBy[orderByIndex].label}</button>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
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
              </div>
            </div>
          </div>
          {loadingBooks ? 
            <div className="loader"><CircularProgress /></div> 
          : !books ? 
            <div className="empty text-center">Nessun libro</div>
          :
            <ul className="table dense nolist">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col">Titolo</div>
                  <div className="col">Autore</div>
                  <div className="col">ISBN-13</div>
                  <div className="col">ISBN-10</div>
                  <div className="col">Creato da</div>
                  <div className="col col-sm-2 col-lg-1">Creato</div>
                  <div className="col">Modificato da</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Modificato</div>
                </div>
              </li>
              {booksList}
            </ul>
          }
          {booksCount > limit &&
            <div className="info-row footer centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchBooks('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (booksCount / limit) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchBooks('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
          }
        </div>
			</div>
		);
	}
}