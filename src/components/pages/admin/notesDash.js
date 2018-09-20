import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { noteRef, notesRef, notificationsRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { funcType, userType } from '../../../config/types';
import { timeSince } from '../../../config/shared';
import CopyToClipboard from '../../copyToClipboard';

export default class NotesDash extends React.Component {
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
    page: 1,
    selectedEl: null,
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

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { limitByIndex } = this.state;
    if (this._isMounted) {
      if (limitByIndex !== prevState.limitByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { count, /* lastVisible,  */limitBy, limitByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const baseRef = notificationsRef.limit(limit);
    const paginatedRef = prev ? baseRef/* .endBefore(lastVisible) */ : baseRef/* .startAfter(lastVisible) */;
    const ref = direction ? paginatedRef : baseRef;
    // console.log('fetching');
    // console.log({ lastVisible: lastVisible && lastVisible.data().displayName, page, direction });
    this.setState({ loading: true });

    const fetcher = () => {
      ref.get().then(fullSnap => {
        if (!fullSnap.empty) {
          // console.log(fullSnap);
          const items = [];
          fullSnap.forEach(item => items.push({ id: item.id }));
          this.setState({
            items,
            count: fullSnap.size,
            lastVisible: fullSnap.docs[fullSnap.size - 1],
            loading: false,
            page: direction ? prev ? (page > 1) ? (page - 1) : 1 : ((page * limit) > count) ? page : (page + 1) : 1
          });
        } else this.setState({ items: null, count: 0, loading: false });
      }).catch(error => console.warn(error));
    }

    if (!direction) {
      notificationsRef.get().then(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ count: fullSnap.size });
          fetcher();
        } else this.setState({ count: 0, page: 1 });
      }).catch(error => console.warn(error));
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
    notesRef(id).onSnapshot(snap => {
      if (!snap.empty) {
        const notes = [];
        snap.forEach(note => notes.push(note.data()));
        const items = [ ...this.state.items ];
        items[selectedObj] = { id, notes };
        this.setState({ items });
      }
    });
  }

	render() {
    const { count, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, page, redirectTo, selectedId } = this.state;
    const { openSnackbar } = this.props;
    const itemsList = (items && items.length > 0 && items.map(item =>
      <li 
        key={item.id} 
        className={`expandible-parent ${selectedId === item.id ? 'expanded' : 'compressed'}`} 
        onClick={() => this.onToggleExpansion(item.id)}>
        <div className="row">
          <div className="col-auto">{item.notes ? item.notes.length : 0}</div>
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
                  <div className="col-auto">{i}</div>
                  <div className="col"><div dangerouslySetInnerHTML={{__html: note.text}} /></div>
                  <div className="col-sm-3 col-lg-2 monotype hide-sm text-center">
                    <CopyToClipboard openSnackbar={openSnackbar} text={note.nid} />
                  </div>
                  <div className="col-auto" title={note.read ? 'Letta' : 'Non letta'}>{note.read ? icon.check() : icon.close()}</div>
                  <div className="col col-sm-2 col-lg-1 text-right">
                    <div className="timestamp">{timeSince(note.created_num)}</div>
                  </div>
                  <div className="absolute-row right btns xs">
                    <button className="btn icon primary" onClick={() => this.onEdit(item.id, note.nid)}>{icon.pencil()}</button>
                    <button className="btn icon red" onClick={() => this.onDeleteRequest(item.id, note.nid)}>{icon.close()}</button>
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
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${items ? items.length : 0} di ${count || 0}`}</span>
                <button className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
                <Menu 
                  anchorEl={limitMenuAnchorEl} 
                  open={Boolean(limitMenuAnchorEl)} 
                  onClose={this.onCloseLimitMenu}>
                  {limitByOptions}
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
              <li className="labels">
                <div className="row">
                  <div className="col-auto">#</div>
                  <div className="col">Uid</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Creato</div>
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