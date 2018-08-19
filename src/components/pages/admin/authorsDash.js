import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { authorRef, authorsRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { getInitials, normalizeString, timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';

export default class AuthorsDash extends React.Component {
 	state = {
    user: this.props.user,
    count: 0,
    desc: true,
    firstVisible: null,
    isOpenDeleteDialog: false,
    items: null,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'lastEdit_num', label: 'Data ultima modifica' }, 
      { type: 'lastEditByUid', label: 'Modificato da' },
      { type: 'displayName', label: 'Nominativo' }, 
      { type: 'sex', label: 'Sesso' },
      { type: 'photoURL', label: 'foto' }
    ],
    orderByIndex: 0,
    page: 1,
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
    const { count, desc, firstVisible, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const baseRef = authorsRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
    const paginatedRef = prev ? baseRef.endBefore(firstVisible) : baseRef.startAfter(lastVisible);
    const ref = direction ? paginatedRef.limit(limit) : baseRef.limit(limit);
    //console.log('fetching items');
    console.log({ 
      first: firstVisible && firstVisible.data().displayName, 
      last: lastVisible && lastVisible.data().displayName, 
      page, 
      direction 
    });
    this.setState({ loading: true });

    const fetcher = () => {
      ref.onSnapshot(snap => {
        //console.log(snap);
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          this.setState({
            firstVisible: snap.docs[0],
            items: items,
            lastVisible: snap.docs[snap.docs.length-1],
            loading: false,
            page: direction ? prev ? page > 1 ? page - 1 : 1 : (page * limit) > count ? page : page + 1 : 1
          });
        } else this.setState({ items: null, count: 0, loading: false });
      });
    }

    if (!direction) {
      authorsRef.get().then(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ count: fullSnap.docs.length });
          fetcher();
        } else this.setState({ count: 0, page: 1 });
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
        //console.log(`Locking ${id}`);
        authorRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        //console.log(`Unlocking ${id}`);
        authorRef(id).update({ edit: true }).then(() => {
          this.props.openSnackbar('Elemento sbloccato', 'success');
        }).catch(error => console.warn(error));
      }
    }
  }

  onDeleteRequest = id => this.setState({ isOpenDeleteDialog: true, selectedId: id });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null });
  onDelete = () => {
    const { selectedId } = this.state;
    //console.log(`Deleting ${selectedId}`);
    authorRef(selectedId).delete().then(() => {
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error));
  }

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const itemsList = (items && (items.length > 0) &&
      items.map((author) => 
        <li key={author.displayName} className={`avatar-row ${author.edit ? '' : 'locked'}`}>
          <div className="row">
            <div className="col-auto hide-xs avatar-container">
              <Avatar className="avatar" src={author.photoURL} alt={author.displayName}>{!author.photoURL && getInitials(author.displayName)}</Avatar>
            </div>
            <div className="col-6 col-sm-4 col-lg-2" title={author.displayName}><CopyToClipboard openSnackbar={openSnackbar} text={author.displayName}/></div>
            <div className="col-1"><button className="btn xs flat" title={author.sex === 'm' ? 'uomo' : 'donna'}>{author.sex}</button></div>
            <div className="col hide-sm">{author.bio}</div>
            <Link to={`/dashboard/${author.lastEditByUid}`} title={author.lastEditByUid} className="col col-sm-3 col-lg-2">{author.lastEditBy}</Link>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(author.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon green" onClick={e => this.onView(normalizeString(author.displayName))}>{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(normalizeString(author.displayName))}>{icon.pencil()}</button>
              <button className={`btn icon ${author.edit ? 'secondary' : 'flat' }`} onClick={e => this.onLock(normalizeString(author.displayName), author.edit)} title={author.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button className="btn icon red" onClick={e => this.onDeleteRequest(normalizeString(author.displayName))}>{icon.close()}</button>
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
			<div className="container" id="authorsDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-sm">{`${items ? items.length : 0} di ${count || 0} autori`}</span>
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
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
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
            <div className="loader"><CircularProgress /></div> 
          : !items ? 
            <div className="empty text-center">Nessun elemento</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto hide-xs"><div className="avatar" title="avatar"></div></div>
                  <div className="col-6 col-sm-4 col-lg-2">Nominativo</div>
                  <div className="col-1">Sesso</div>
                  <div className="col hide-sm">Bio</div>
                  <div className="col col-sm-3 col-lg-2">Modificato da</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Modificato</div>
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