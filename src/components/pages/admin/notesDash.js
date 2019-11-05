import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { countRef, noteRef, /* notesGroupRef, */ notesRef, notificationsRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { handleFirestoreError, timeSince } from '../../../config/shared';
import { funcType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

export default class NotesDash extends Component {
 	state = {
    count: 0,
    desc: true,
    firstVisible: null,
    isOpenDeleteDialog: false,
    // isOpenFormDialog: false,
    items: null,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    page: 1,
    selectedEl: null,
    selectedId: null,
    loading: true
	}

	static propTypes = {
    onToggleDialog: funcType.isRequired,
    openSnackbar: funcType.isRequired
	}

	componentDidMount() { 
    this._isMounted = true;
    this.fetch();
    // this.getLastNotes(); // TODO: 
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { limitByIndex } = this.state;
    if (limitByIndex !== prevState.limitByIndex) {
      this.fetch();
    }
  }

  componentWillUnmount() {
    this.unsubNotesFetch && this.unsubNotesFetch();
    this.unsubNotificationsFetch && this.unsubNotificationsFetch();
  }
    
  fetch = e => {
    const { desc, firstVisible, lastVisible, limitBy, limitByIndex } = this.state;
    const direction = e && e.currentTarget.dataset.direction;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const ref = notificationsRef.orderBy('count', desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const dRef = direction ? paginatedRef : ref;
    
    if (this._isMounted) this.setState({ loading: true });

    const fetcher = () => {
      this.unsubNotificationsFetch = dRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push({ id: item.id, count: item.data().count }));
          this.setState(prevState => ({
            firstVisible: snap.docs[prev ? snap.size -1 : 0],
            items: prev ? items.reverse() : items,
            lastVisible: snap.docs[prev ? 0 : snap.size -1],
            loading: false,
            page: direction ? prev ? prevState.page - 1 : ((prevState.page * limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1
          }));
        } else this.setState({ items: null, count: 0, loading: false });
      });
    }

    if (!direction) {
      countRef('notifications').get().then(fullSnap => {
        if (fullSnap.exists) { 
          if (this._isMounted) {
            this.setState({ count: fullSnap.data().count });
          }
          fetcher();
        } else if (this._isMounted) {
          this.setState({ count: 0, page: 1 });
        }
      }).catch(err => this.props.openSnackbar(handleFirestoreError(err), 'error'));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenLimitMenu = e => this.setState({ limitMenuAnchorEl: e.currentTarget });
  onChangeLimitBy = (e, i) => this.setState({ limitByIndex: i, limitMenuAnchorEl: null, page: 1 });
  onCloseLimitMenu = () => this.setState({ limitMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: id });
  
  onEdit = (id, el) => this.props.onToggleDialog(id, el);

  onDeleteRequest = (id, el) => this.setState({ isOpenDeleteDialog: true, selectedId: id, selectedEl: el });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null, selectedEl: null });
  onDelete = () => {
    const { selectedEl, selectedId } = this.state;
    noteRef(selectedId, selectedEl).delete().then(() => {
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error));
  }

  onToggleExpansion = id => {
    this.setState({ selectedId: id });
    const selectedObj = this.state.items.findIndex(obj => obj.id === id);
    const prevState = this.state;
    this.unsubNotesFetch = notesRef(id).orderBy('created_num', 'desc').limit(200).onSnapshot(snap => {
      if (!snap.empty) {
        const notes = [];
        snap.forEach(note => notes.push(note.data()));
        const items = [ ...prevState.items ];
        items[selectedObj] = { ...items[selectedObj], notes };
        this.setState({ items });
      }
    });
  }

  /* getLastNotes = (limit = 5) => {
    const lRef = notesGroupRef.limit(limit);
    lRef.get().then(snap => {
      if (!snap.empty) {
        // console.log(snap);
        const items = [];
        snap.forEach(item => items.push(item.data()));
        console.log(items);
      }
    })
  } */

	render() {
    const { count, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, page, redirectTo, selectedId } = this.state;
    const { openSnackbar } = this.props;
    const itemsList = (items && items.length > 0 && items.map(item =>
      <li 
        key={item.id} 
        role="treeitem"
        className={`expandible-parent ${selectedId === item.id ? 'expanded' : 'compressed'}`} 
        onKeyDown={() => this.onToggleExpansion(item.id)}
        onClick={() => this.onToggleExpansion(item.id)}>
        <div className="row">
          <div className="col-auto">{item.count || 0}</div>
          <div className="col monotype"><CopyToClipboard openSnackbar={openSnackbar} text={item.id}/></div>
          <div className="col-1 text-right expandible-icon">
            {icon.chevronDown()}
          </div>
        </div>
        {item.notes && item.notes.length > 0 && 
          <ul className="expandible">
            {item.notes.map((note, i) =>
              <li key={note.nid} className={note.read ? 'read' : 'not-read'}>
                <div className="row">
                  <div className="col-auto">{i + 1}</div>
                  <div className="col"><div dangerouslySetInnerHTML={{__html: note.text}} /></div>
                  <div className="col-sm-3 col-lg-2 monotype hide-sm text-center">
                    <CopyToClipboard openSnackbar={openSnackbar} text={note.nid} />
                  </div>
                  <div className="col-auto" title={note.read ? 'Letta' : 'Non letta'}>{note.read ? icon.check() : icon.close()}</div>
                  <div className="col-auto col-sm-2 col-lg-1 text-right">
                    <div className="timestamp">{timeSince(note.created_num)}</div>
                  </div>
                  <div className="absolute-row right btns xs">
                    <button type="button" className="btn icon primary" onClick={() => this.onEdit(item.id, note.nid)}>{icon.pencil()}</button>
                    <button type="button" className="btn icon red" onClick={() => this.onDeleteRequest(item.id, note.nid)}>{icon.close()}</button>
                  </div>
                </div>
              </li>
            )}
          </ul>
        }
      </li>
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

    if (redirectTo) return <Redirect to={`/notifications/${redirectTo}`} />

		return (
			<div className="container" id="notesDashComponent">
        <div className="card dark" style={{ minHeight: 200, }}>
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
            </div>
          </div>
          {loading ? 
            <div aria-hidden="true" className="loader"><CircularProgress /></div> 
          : !items ? 
            <div className="empty text-center">Nessun elemento</div>
          :
            <>
              <ul className="table dense nolist font-sm" role="tree">
                <li className="labels">
                  <div className="row">
                    <div className="col-auto">#</div>
                    <div className="col">Uid</div>
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
            </>
          }
        </div>

        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={this.onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
			</div>
		);
	}
}