import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { collectionBooksRef, collectionRef, collectionsRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';

export default class collectionsDash extends React.Component {
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
    const { desc, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const cRef = collectionsRef/* .orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc') */.limit(limit);
    //console.log('fetching items');
    this.setState({ loading: true });
    
    collectionsRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ count: fullSnap.docs.length });
        //console.log({startAt, lastVisible_id: lastVisible ? lastVisible.id : fullSnap.docs[startAt].id, limit, direction, page});
        const ref = direction ? cRef.startAt(lastVisible || fullSnap.docs[startAt]) : cRef;

        ref.onSnapshot(snap => {
          if (!snap.empty) {
            const items = [];
            snap.forEach(item => items.push({ ...item.data(), title: item.id, books_num: item.data().books_num || '-' }));
            this.setState(prevState => ({
              items: items,
              lastVisible: snap.docs[startAt],
              loading: false,
              page: direction ? (direction === 'prev') ? prevState.page - 1 : ((prevState.page * limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ items: null, lastVisible: null, loading: false });
        });
      } else this.setState({ count: 0 });
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
      //console.log(`Editing ${id}`);
      //TODO
      this.setState({ redirectTo: id }); 
    }
  }

  onLock = (id, state) => {
    if (id) {
      if (state) {
        console.log(`Locking ${id}`);
        collectionRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        console.log(`Unlocking ${id}`);
        collectionRef(id).update({ edit: true }).then(() => {
          this.props.openSnackbar('Elemento sbloccato', 'success');
        }).catch(error => console.warn(error));
      }
    }
  }

  onDeleteRequest = id => this.setState({ isOpenDeleteDialog: true, selectedId: id });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null });
  onDelete = () => {
    console.log(`Deleting ${this.state.selectedId}`);
    this.setState({ isOpenDeleteDialog: false });
    this.props.openSnackbar('Elemento cancellato', 'success');
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    //const { openSnackbar } = this.props;

    const itemsList = (items && (items.length > 0) &&
      items.map((collection) => 
        <li key={collection.title} className={`${collection.edit ? '' : 'locked'}`}>
          <div className="row">
            <Link to={`/collection/${collection.title}`} className="col">
              {collection.title}
            </Link>
            <div className="col">{collection.books_num}</div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(collection.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon green" onClick={e => this.onView(collection.title)} title="Anteprima">{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(collection.title)} title="Modifica">{icon.pencil()}</button>
              <button className={`btn icon ${collection.edit ? 'secondary' : 'flat' }`} onClick={e => this.onLock(collection.title, collection.edit)} title={collection.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button className="btn icon red" onClick={e => this.onDeleteRequest(collection.title)}>{icon.close()}</button>
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

    if (redirectTo) return <Redirect to={`/collection/${redirectTo}`} />

		return (
			<div className="container" id="collectionsDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${items ? items.length : 0} di ${count || 0} collezioni`}</span>
                <button className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
                <Menu 
                  anchorEl={limitMenuAnchorEl} 
                  open={Boolean(limitMenuAnchorEl)} 
                  onClose={this.onCloseLimitMenu}>
                  {limitByOptions}
                </Menu>
              </div>
              <div className="col-auto">
                <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                <Menu 
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={this.onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
              </div>
            </div>
          </div>
          {loading ? 
            <div className="loader"><CircularProgress /></div> 
          : !items ? 
            <div className="empty text-center">Nessun elemento</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="labels">
                <div className="row">
                  <div className="col">Titolo</div>
                  <div className="col">Libri</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Modificata</div>
                </div>
              </li>
              {itemsList}
            </ul>
          }
          {items && count > limitBy[limitByIndex] &&
            <div className="info-row centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>
              <span className="page">{page}</span>
              <button 
                disabled={page > (count / limitBy[limitByIndex]) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
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
            <button className="btn flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button className="btn primary" onClick={this.onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
			</div>
		);
	}
}