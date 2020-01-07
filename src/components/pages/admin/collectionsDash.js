import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { collectionBooksRef, collectionRef, collectionsRef, countRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { handleFirestoreError, normURL } from '../../../config/shared';
import { boolType, funcType } from '../../../config/types';
import PaginationControls from '../../paginationControls';

const limitBy = [ 15, 25, 50, 100, 250, 500];
const orderBy = [ 
  { type: 'title', label: 'Titolo'}
];

export default class collectionsDash extends Component {
 	state = {
    count: 0,
    desc: false,
    isOpenDeleteDialog: false,
    items: null,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderByIndex: 0,
    page: 1,
    selectedId: null,
    loading: false
	}

	static propTypes = {
    inView: boolType.isRequired,
    onToggleDialog: funcType.isRequired,
    openSnackbar: funcType.isRequired
  } 

	componentDidMount() { 
    this._isMounted = true;
    if (this.props.inView) this.fetch();
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, items, limitByIndex, orderByIndex } = this.state;
    if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
      if (this.props.inView) this.fetch();
    }
    if (this.props.inView !== prevProps.inView && !items) {
      if (this.props.inView) this.fetch();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.timer && clearTimeout(this.timer);
    this.unsubCollectionsFetch && this.unsubCollectionsFetch();
  }
    
  fetch = e => {
    const { desc, firstVisible, lastVisible, limitByIndex, orderByIndex } = this.state;
    const direction = e && e.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const limit = limitBy[limitByIndex];
    const ref = collectionsRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const lRef = direction ? paginatedRef : ref;
    
    if (this._isMounted) this.setState({ loading: true });

    const fetcher = () => {
      this.unsubCollectionsFetch = lRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => {
            const books = [];
            collectionBooksRef(item.id).orderBy('bcid', 'desc').get().then(snap => {
              if (!snap.empty) {
                snap.forEach(book => books.push(book.data().bid));
              }
            });
            items.push({ ...item.data(), title: item.id, books });
          });
          this.setState(prevState => ({
            firstVisible: snap.docs[prev ? snap.size -1 : 0],
            items: prev ? items.reverse() : items,
            lastVisible: snap.docs[prev ? 0 : snap.size -1],
            loading: false,
            page: direction ? prev ? prevState.page - 1 : ((prevState.page * limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1
          }));
        } else this.setState({ firstVisible: null, items: null, lastVisible: null, loading: false });
      });
    }

    if (!direction) {
      countRef('collections').get().then(fullSnap => {
        if (fullSnap.exists) {
          if (this._isMounted) {
            this.setState({ count: fullSnap.data().count }, () => fetcher());
          }
        } else if (this._isMounted) {
          this.setState({ count: 0 });
        }
      }).catch(err => this.props.openSnackbar(handleFirestoreError(err), 'error'));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));
  
  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onOpenLimitMenu = e => this.setState({ limitMenuAnchorEl: e.currentTarget });
  onChangeLimitBy = (e, i) => this.setState({ limitByIndex: i, limitMenuAnchorEl: null, page: 1 });
  onCloseLimitMenu = () => this.setState({ limitMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: normURL(id) });

  onEdit = id => this.props.onToggleDialog(id);

  onLock = (id, state) => {
    if (id) {
      if (state) {
        // console.log(`Locking ${id}`);
        collectionRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        // console.log(`Unlocking ${id}`);
        collectionRef(id).update({ edit: true }).then(() => {
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
    collectionRef(selectedId).delete().then(() => {
      this.onCloseDeleteDialog();
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error));
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitByIndex, limitMenuAnchorEl, loading, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;

    if (redirectTo) return <Redirect to={`/collection/${redirectTo}`} />

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

    const limit = limitBy[limitByIndex];
    const skeletons = [...Array(limit)].map((e, i) => <li key={i} className="avatar-row skltn dash" />);

    const itemsList = loading ? skeletons : !items ? <li className="empty text-center">Nessun elemento</li> : (
      items.map(item => (
        <li key={item.title} className={`${item.edit ? '' : 'locked'}`}>
          <div className="row">
            <Link to={`/collection/${normURL(item.title)}`} className="col">
              {item.title}
            </Link>
            <div className="col-5 col-lg-8" title={item.description}>{item.description}</div>
            <div className="col-1 text-right">{item.books_num}</div>
            <div className="absolute-row right btns xs">
              <button type="button" className="btn icon green" onClick={() => this.onView(item.title)} title="Anteprima">{icon.eye}</button>
              <button type="button" className="btn icon primary" onClick={() => this.onEdit(item.title)} title="Modifica">{icon.pencil}</button>
              <button type="button" className={`btn icon ${item.edit ? 'secondary' : 'flat' }`} onClick={() => this.onLock(item.title, item.edit)} title={item.edit ? 'Blocca' : 'Sblocca'}>{icon.lock}</button>
              <button type="button" className="btn icon red" onClick={() => this.onDeleteRequest(item.title)}>{icon.close}</button>
            </div>
          </div>
        </li>
      ))
    );

		return (
      <>
        <div className="head nav">
          <div className="row">
            <div className="col">
              <span className="counter hide-md">{`${items ? items.length : 0} di ${count || 0}`}</span>
              <button type="button" className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
              <Menu 
                className="dropdown-menu"
                anchorEl={limitMenuAnchorEl} 
                open={Boolean(limitMenuAnchorEl)} 
                onClose={this.onCloseLimitMenu}>
                {limitByOptions}
              </Menu>
            </div>
            <div className="col-auto">
              <button type="button" className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
              <Menu 
                className="dropdown-menu"
                anchorEl={orderMenuAnchorEl} 
                open={Boolean(orderMenuAnchorEl)} 
                onClose={this.onCloseOrderMenu}>
                {orderByOptions}
              </Menu>
              <button type="button" className={`btn sm flat counter icon rounded ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown}</button>
            </div>
          </div>
        </div>
        
        <ul className="table dense nolist font-sm">
          <li className="labels">
            <div className="row">
              <div className="col">Titolo</div>
              <div className="col-5 col-lg-8">Descrizione</div>
              <div className="col-1 text-right">Libri</div>
            </div>
          </li>
          {itemsList}
        </ul>

        <PaginationControls 
          count={count} 
          fetch={this.fetch}
          forceVisibility
          limit={limit}
          page={page}
        />

        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={this.onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogContent>
            <DialogContentText id="remove-dialog-description">
              Ricordati di rimuovere il riferimento alla collezione nei singoli libri.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
			</>
		);
	}
}