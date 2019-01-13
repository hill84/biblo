import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { quoteRef, quotesRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

export default class QuotesDash extends React.Component {
 	state = {
    user: this.props.user,
    count: 0,
    desc: true,
    isOpenDeleteDialog: false,
    isOpenFormDialog: false,
    items: null,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'lastEdit_num', label: 'Data ultima modifica'},
      { type: 'EDIT.lastEditByUid', label: 'Modificata da'},
      { type: 'author', label: 'Autore'}, 
      { type: 'bookTitle', label: 'Libro'}, 
      { type: 'coverURL', label: 'Cover'}
    ],
    orderByIndex: 0,
    page: 1,
    selectedId: null,
    loading: true
	}

	static propTypes = {
    onToggleDialog: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    user: userType
  }

	componentDidMount() { 
    this._isMounted = true;
    this.fetch();
  }

	componentWillUnmount() {
    this._isMounted = false;
    this.unsubQuotesFetch && this.unsubQuotesFetch();
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { count, desc, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const baseRef = quotesRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    const paginatedRef = prev ? baseRef.endBefore(lastVisible) : baseRef.startAfter(lastVisible);
    const ref = direction ? paginatedRef : baseRef;
    // console.log('fetching');
    // console.log({ lastVisible: lastVisible && lastVisible.data().displayName, page, direction });
    if (this._isMounted) {
      this.setState({ loading: true });
    }

    const fetcher = () => {
      this.unsubQuotesFetch = ref.onSnapshot(snap => {
        // console.log(snap);
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          // console.log({ limit, length: snap.docs.length, rest: limit - snap.docs.length });
          this.setState({
            items,
            lastVisible: snap.docs[snap.docs.length-1],
            loading: false,
            page: direction ? prev ? (page > 1) ? (page - 1) : 1 : ((page * limit) > count) ? page : (page + 1) : 1
          });
        } else this.setState({ items: null, count: 0, loading: false });
      });
    }

    if (!direction) {
      quotesRef.get().then(fullSnap => {
        if (!fullSnap.empty) { 
          if (this._isMounted) {
            this.setState({ count: fullSnap.docs.length });
          }
          fetcher();
        } else {
          if (this._isMounted) {
            this.setState({ count: 0, page: 1 });
          }
        }
      }).catch(error => console.warn(error));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onOpenLimitMenu = e => this.setState({ limitMenuAnchorEl: e.currentTarget });
  onChangeLimitBy = (e, i) => this.setState({ limitByIndex: i, limitMenuAnchorEl: null, page: 1 });
  onCloseLimitMenu = () => this.setState({ limitMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: id });
  
  onEdit = id => this.props.onToggleDialog(id);

  onLock = (id, state) => {
    if (id) {
      if (state) {
        // console.log(`Locking ${id}`);
        quoteRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        // console.log(`Unlocking ${id}`);
        quoteRef(id).update({ edit: true }).then(() => {
          this.props.openSnackbar('Elemento sbloccato', 'success');
        }).catch(error => console.warn(error));
      }
    }
  }

  onDeleteRequest = id => this.setState({ isOpenDeleteDialog: true, selectedId: id });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null });
  onDelete = () => {
    const { selectedId } = this.state;
    // console.log(`Deleting ${selectedId}`);
    quoteRef(selectedId).delete().then(() => {
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error));
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const itemsList = (items && items.length &&
      items.map(item => 
        <li key={item.qid} className={`${item.edit ? '' : 'locked'}`}>
          <div className="row">
            <div className="col-auto">
              <div className="mock-cover xs" style={{backgroundImage: `url(${item.coverURL})`}} />
            </div>
            {item.bid ? <Link to={`/book/${item.bid}`} className="col">{item.bookTitle}</Link> : <div className="col">{item.bookTitle}</div>}
            <Link to={`/author/${item.author}`} className="col">{item.author}</Link>
            <div className="col-5 hide-sm">{item.quote}</div>
            <div className="col hide-sm monotype"><CopyToClipboard openSnackbar={openSnackbar} text={item.qid}/></div>
            <Link to={`/dashboard/${item.lastEditByUid}`} title={item.lastEditByUid} className="col hide-sm">
              {item.lastEditBy}
            </Link>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(item.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button type="button" className="btn icon green" onClick={() => this.onView(item.author)}>{icon.eye()}</button>
              <button type="button" className="btn icon primary" onClick={() => this.onEdit(item.qid)}>{icon.pencil()}</button>
              <button type="button" className={`btn icon ${item.edit ? 'secondary' : 'flat' }`} onClick={() => this.onLock(item.qid, item.edit)} title={item.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button type="button" className="btn icon red" onClick={() => this.onDeleteRequest(item.qid)}>{icon.close()}</button>
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

    if (redirectTo) return <Redirect to={`/author/${redirectTo}`} />

		return (
			<div className="container" id="quotesDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${items ? items.length : 0} di ${count || 0}`}</span>
                <button type="button" className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
                <Menu 
                  anchorEl={limitMenuAnchorEl} 
                  open={Boolean(limitMenuAnchorEl)} 
                  onClose={this.onCloseLimitMenu}>
                  {limitByOptions}
                </Menu>
              </div>
              <div className="col-auto">
                <button type="button" className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                <button type="button" className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                <Menu 
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={this.onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
              </div>
            </div>
          </div>
          {loading ? 
            <div aria-hidden="true" className="loader"><CircularProgress /></div> 
          : !items ? 
            <div className="empty text-center">Nessun elemento</div>
          :
            <React.Fragment>
              <ul className="table dense nolist font-sm">
                <li className="labels">
                  <div className="row">
                    <div className="col-auto"><div className="mock-cover xs hidden" title="cover" /></div>
                    <div className="col">Libro</div>
                    <div className="col">Autore</div>
                    <div className="col-5 hide-sm">Testo</div>
                    <div className="col hide-sm">Qid</div>
                    <div className="col hide-sm">Modificato da</div>
                    <div className="col col-sm-2 col-lg-1 text-right">Modificato</div>
                  </div>
                </li>
                {itemsList}
              </ul>
              <PaginationControls 
                count={count} 
                fetchNext={() => this.fetch('next')} 
                fetchPrev={() => this.fetch('prev')} 
                limit={limitBy[limitByIndex]}
                page={page}
              />
            </React.Fragment>
          }
        </div>

        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={this.onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Procedere con l'eliminazione?</DialogTitle>
          <DialogActions>
            <button type="button" className="btn flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn primary" onClick={this.onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
			</div>
		);
	}
}