import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { countRef, noteRef, userRef, userShelfRef, usersRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { getInitials, handleFirestoreError } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

export default class UsersDash extends React.Component {
 	state = {
    user: this.props.user,
    count: 0,
    desc: false,
    firstVisible: null,
    isOpenDeleteDialog: false,
    items: null,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'creationTime', label: 'Data'}, 
      { type: 'displayName', label: 'Nome'}, 
      { type: 'uid', label: 'uid'}, 
      { type: 'email', label: 'Email'},
      { type: 'stats.shelf_num', label: 'Libri'},
      { type: 'stats.wishlist_num', label: 'Desideri'},
      { type: 'stats.reviews_num', label: 'Recensioni'},
      { type: 'stats.ratings_num', label: 'Voti'}
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
    this.unsubUsersFetch && this.unsubUsersFetch();
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
      this.fetch();
    }
  }
    
  fetch = e => {
    const { desc, firstVisible, lastVisible,  limitBy, limitByIndex, orderBy, orderByIndex } = this.state;
    const direction = e && e.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const limit = limitBy[limitByIndex];
    const ref = usersRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const dRef = direction ? paginatedRef : ref;

    if (this._isMounted) {
      this.setState({ loading: true });
    }

    const fetcher = () => {
      this.unsubUsersFetch = dRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
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
      countRef('users').get().then(fullSnap => {
        if (fullSnap.exists) {
          if (this._isMounted) {
            this.setState({ count: fullSnap.data().count }, () => fetcher());
          }
        } else {
          if (this._isMounted) {
            this.setState({ count: 0 });
          }
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

  onView = e => {
    const id = e.currentTarget.parentNode.dataset.id;
    this.setState({ redirectTo: id });
  }

  onNote = e => {
    const id = e.currentTarget.parentNode.dataset.id;
    this.props.onToggleDialog(id);
  }

  onLock = e => {
    const id = e.currentTarget.parentNode.dataset.id;
    const state = e.currentTarget.parentNode.dataset.state === 'true';
    // console.log(`${state ? 'Un' : 'L'}ocking ${id}`);
    userRef(id).update({ 'roles.editor': !state }).then(() => {
      this.props.openSnackbar(`Elemento ${state ? '' : 's'}bloccato`, 'success');
    }).catch(err => console.warn(err));
  }

  onDeleteRequest = e => {
    const id = e.currentTarget.parentNode.dataset.id;
    this.setState({ isOpenDeleteDialog: true, selectedId: id });
  }
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null });
  onDelete = () => {
    const { selectedId } = this.state;
    // console.log(`Deleting ${selectedId}`);
    userRef(selectedId).delete().then(() => {
      userShelfRef(selectedId).delete().then(() => {
        console.log(`User reviews deleted`);
      }).catch(err => console.warn(err));
      noteRef(selectedId).delete().then(() => {
        console.log(`User notifications deleted`);
      }).catch(err => console.warn(err));
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(err => console.warn(err));
  }

  onChangeRole = e => {
    const id = e.currentTarget.parentNode.dataset.id;
    const role = e.currentTarget.dataset.role;
    const state = e.currentTarget.dataset.state === 'true';
    userRef(id).update({ [`roles.${role}`]: !state }).catch(err => console.warn(err));
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const itemsList = (items && items.length &&
      items.map(item => 
        <li key={item.uid} className={`avatar-row ${item.roles.editor ? '' : 'locked'}`}>
          <div className="row">
            <div className="col-auto hide-xs avatar-container">
              <Avatar className="avatar" src={item.photoURL} alt={item.displayName}>{!item.photoURL && getInitials(item.displayName)}</Avatar>
            </div>
            <Link to={`/dashboard/${item.uid}`} className="col hide-sm" title={item.displayName}>
              {item.displayName}
            </Link>
            <div className="col monotype" title={item.uid}>
              <CopyToClipboard openSnackbar={openSnackbar} text={item.uid} />
            </div>
            <div className="col monotype hide-sm" title={item.email}>
              <CopyToClipboard openSnackbar={openSnackbar} text={item.email} />
            </div>
            <div className="col col-sm-3 col-lg-2">
              <div className="row text-center">
                <div className="col">{item.stats.shelf_num}</div>
                <div className="col">{item.stats.wishlist_num}</div>
                <div className="col">{item.stats.reviews_num}</div>
                <div className="col hide-md">{item.stats.ratings_num}</div>
              </div>
            </div>
            <div className="col col-sm-2 btns xs text-center" data-id={item.uid}>
              <div className={`btn rounded icon ${item.roles.editor ? '' : 'flat'}`} data-role="editor" data-state={item.roles.editor} onClick={this.onChangeRole} title="editor">E</div>
              <div className={`btn rounded icon ${item.roles.premium ? '' : 'flat'}`} data-role="premium" data-state={item.roles.premium} onClick={this.onChangeRole} title="premium">P</div>
              <div className={`btn rounded icon ${item.roles.admin ? '' : 'flat'}`} data-role="admin" data-state={item.roles.admin} onClick={this.onChangeRole} title="admin">A</div>
            </div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{new Date(item.creationTime).toLocaleDateString()}</div>
            </div>
            <div className="absolute-row right btns xs" data-id={item.uid} data-state={item.roles.editor}>
              <button type="button" className="btn icon green" onClick={this.onView} title="anteprima">{icon.eye()}</button>
              <button type="button" className="btn icon primary" onClick={this.onNote} title="Invia notifica">{icon.bell()}</button>
              <button type="button" className={`btn icon ${item.roles.editor ? 'secondary' : 'flat' }`} onClick={this.onLock} title={item.roles.editor ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button type="button" className="btn icon red" onClick={this.onDeleteRequest} title="elimina">{icon.close()}</button>
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

    if (redirectTo) return <Redirect to={`/dashboard/${redirectTo}`} />

		return (
			<div className="container" id="usersDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
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
                <button type="button" className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                <Menu 
                  className="dropdown-menu"
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
                <li className="avatar-row labels">
                  <div className="row">
                    <div className="col-auto hide-xs"><div className="avatar hidden" title="avatar" /></div>
                    <div className="col hide-sm">Nominativo</div>
                    <div className="col">Uid</div>
                    <div className="col hide-sm">Email</div>
                    <div className="col col-sm-3 col-lg-2">
                      <div className="row text-center">
                        <div className="col" title="Libri">{icon.book()}</div>
                        <div className="col" title="Desideri">{icon.heart()}</div>
                        <div className="col" title="Recensioni">{icon.review()}</div>
                        <div className="col hide-md" title="Voti">{icon.star()}</div>
                      </div>
                    </div>
                    <div className="col col-sm-2 text-center">Ruoli</div>
                    <div className="col col-sm-2 col-lg-1 text-right">Creato</div>
                  </div>
                </li>
                {itemsList}
              </ul>
              <PaginationControls 
                count={count} 
                fetch={this.fetch} 
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
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Cancellando l'utente verranno rimosse anche la sua libreria e la cronologia delle sue notifiche.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
			</div>
		);
	}
}