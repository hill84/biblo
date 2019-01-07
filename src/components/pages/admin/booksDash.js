import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import ImageZoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { bookRef, booksRef /* , reviewRef */ } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

export default class BooksDash extends React.Component {
 	state = {
    user: this.props.user,
    count: 0,
    desc: true,
    isOpenDeleteDialog: false,
    items: null,
    lastVisible: null,
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
    selectedId: null,
    loading: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

	componentDidMount() { 
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubBooksFetch && this.unsubBooksFetch();
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
    const { desc, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const bRef = booksRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    // console.log('fetching items');
    this.setState({ loading: true });
    
    booksRef.get().then(fullSnap => {
      if (!fullSnap.empty) {
        if (this._isMounted) {
          this.setState({ count: fullSnap.docs.length });
        }
        // console.log({startAt, lastVisible_id: lastVisible ? lastVisible.id : fullSnap.docs[startAt].id, limit, direction, page});
        const ref = direction ? bRef.startAt(lastVisible || fullSnap.docs[startAt]) : bRef;
        this.unsubBooksFetch = ref.onSnapshot(snap => {
          // console.log(snap);
          if (!snap.empty) {
            const items = [];
            snap.forEach(item => items.push(item.data()));
            this.setState(prevState => ({
              items,
              lastVisible: snap.docs[startAt],
              loading: false,
              page: direction ? (direction === 'prev') ? prevState.page - 1 : ((prevState.page * limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ items: null, lastVisible: null, loading: false });
        });
      } else {
        if (this._isMounted) {
          this.setState({ count: 0 });
        }
      }
    }).catch(error => console.warn(error));
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
    if (id) {
      // console.log(`Editing ${id}`);
      // TODO
      this.setState({ redirectTo: id }); 
    }
  }

  onLock = (id, state) => {
    if (id) {
      if (state) {
        // console.log(`Locking ${id}`);
        bookRef(id).update({ 'EDIT.edit': false }).then(() => {
          this.props.openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        // console.log(`Unlocking ${id}`);
        bookRef(id).update({ 'EDIT.edit': true }).then(() => {
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
    bookRef(selectedId).delete().then(() => {
      /* 
      reviewRef(selectedId).delete().then(() => {
        console.log(`Reviews deleted`);
      }).catch(error => console.warn(error)); 
      */
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error));
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const itemsList = (items && items.length &&
      items.map(item => 
        <li key={item.bid} className={`avatar-row ${item.EDIT.edit ? '' : 'locked'}`}>
          <div className="row">
            <div className="col-auto">
              <div className="mock-cover xs overflow-hidden" style={{position: 'relative', backgroundImage: `url(${item.covers[0]})`}}>
                <ImageZoom
                  defaultStyles={{ 
                    zoomContainer: { zIndex: 1200 }, 
                    overlay: { backgroundColor: 'rgba(38,50,56,0.8)' } 
                  }}
                  image={{ src: item.covers[0], className: 'thumb hidden' }}
                  zoomImage={{ className: 'magnified', maxHeight: '400px' }}
                />
              </div>
            </div>
            <Link to={`/book/${item.bid}`} className="col">
              {item.title}
            </Link>
            <Link to={`/author/${Object.keys(item.authors)[0]}`} className="col">
              {Object.keys(item.authors)[0]}
            </Link>
            <div className="col hide-md monotype" title={item.bid}>
              <CopyToClipboard openSnackbar={openSnackbar} text={item.bid}/>
            </div>
            <div className="col hide-md monotype" title={item.ISBN_13}>
              <CopyToClipboard openSnackbar={openSnackbar} text={item.ISBN_13}/>
            </div>
            <div className="col hide-md monotype" title={item.ISBN_10}>
              <CopyToClipboard openSnackbar={openSnackbar} text={item.ISBN_10} />
            </div>
            <Link to={`/dashboard/${item.EDIT.createdByUid}`} title={item.EDIT.createdByUid} className="col hide-sm">
              {item.EDIT.createdBy}
            </Link>
            <div className="col hide-sm col-lg-1">
              <div className="timestamp">{new Date(item.EDIT.created_num).toLocaleDateString()}</div>
            </div>
            <Link to={`/dashboard/${item.EDIT.lastEditByUid}`} title={item.EDIT.lastEditByUid} className="col">
              {item.EDIT.lastEditBy}
            </Link>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(item.EDIT.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button type="button" className="btn icon green" onClick={() => this.onView(item.bid)} title="Anteprima">{icon.eye()}</button>
              <button type="button" className="btn icon primary" onClick={() => this.onEdit(item.bid)} title="Modifica">{icon.pencil()}</button>
              <button type="button" className={`btn icon ${item.EDIT.edit ? 'secondary' : 'flat' }`} onClick={() => this.onLock(item.bid, item.EDIT.edit)} title={item.EDIT.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button type="button" className="btn icon red" onClick={() => this.onDeleteRequest(item.bid)}>{icon.close()}</button>
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
        onClick={e => this.onChangeOrderBy(e, index)}>
        {option.label}
      </MenuItem>
    ));

    const limitByOptions = limitBy.map((option, index) => (
      <MenuItem
        key={option}
        disabled={index === -1}
        selected={index === limitByIndex}
        onClick={e => this.onChangeLimitBy(e, index)}>
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
                <Menu 
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={this.onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
                <button type="button" className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
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
                    <div className="col-auto"><div className="mock-cover xs hidden" /></div>
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