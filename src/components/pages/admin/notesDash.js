import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
/* import Link from 'react-router-dom/Link'; */
import Redirect from 'react-router-dom/Redirect';
import { noteRef, notesRef/* , pubNoteRef */ } from '../../../config/firebase';
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
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { count, desc, lastVisible, limitBy, limitByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const baseRef = notesRef.limit(limit);
    const paginatedRef = prev ? baseRef/* .endBefore(lastVisible) */ : baseRef/* .startAfter(lastVisible) */;
    const ref = direction ? paginatedRef : baseRef;
    //console.log('fetching');
    //console.log({ lastVisible: lastVisible && lastVisible.data().displayName, page, direction });
    this.setState({ loading: true });

    const fetcher = () => {
      ref.onSnapshot(snap => {
        console.log(snap);
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push({ notes: item.data().notes, id: item.id, expanded: false }));
          //console.log({ limit, length: snap.docs.length, rest: limit - snap.docs.length });
          this.setState({
            items: items,
            lastVisible: snap.docs[snap.docs.length-1],
            loading: false,
            page: direction ? prev ? (page > 1) ? (page - 1) : 1 : ((page * limit) > count) ? page : (page + 1) : 1
          });
        } else this.setState({ items: null, count: 0, loading: false });
      });
    }

    if (!direction) {
      notesRef.get().then(fullSnap => {
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
  
  onEdit = (id, i) => this.props.onToggleDialog(id, i);

  onDeleteRequest = id => this.setState({ isOpenDeleteDialog: true, selectedId: id });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false, selectedId: null });
  onDelete = () => {
    const { selectedId } = this.state;
    //console.log(`Deleting ${selectedId}`);
    //TODO
    /* noteRef(selectedId).delete().then(() => {
      this.setState({ isOpenDeleteDialog: false });
      this.props.openSnackbar('Elemento cancellato', 'success');
    }).catch(error => console.warn(error)); */
  }

  onToggleExpansion = id => this.setState({ selectedId: id });

	render() {
    const { count, desc, isOpenDeleteDialog, items, limitBy, limitByIndex, limitMenuAnchorEl, loading, page, redirectTo, selectedId } = this.state;
    const { openSnackbar } = this.props;

    const itemsList = (items && items.length &&
      items.map(item => 
        <li 
          key={item.id} 
          class={`expandible-parent ${selectedId === item.id ? 'expanded' : 'compressed'}`} 
          onClick={() => this.onToggleExpansion(item.id)}>
          <div className="row">
            <div className="col-auto">{item.notes ? item.notes.length : 0}</div>
            <div className="col monotype"><CopyToClipboard openSnackbar={openSnackbar} text={item.id}/></div>
            <div className="col-1 text-right expandible-icon">
              {icon.chevronDown()}
            </div>
          </div>
          {item.notes && <ul class="expandible">
            {item.notes.map((note, i) =>
              <li key={`${item.id}-${i}`} className={note.read ? 'read' : 'not-read'}>
                <div className="row">
                  <div className="col-auto">{i}</div>
                  <div className="col"><div dangerouslySetInnerHTML={{__html: note.text}} /></div>
                  {note.read && <div className="col-auto text-right" title="Letta">{icon.check()}</div>}
                  <div className="col col-sm-2 col-lg-1 text-right">
                    <div className="timestamp">{timeSince(note.created_num)}</div>
                  </div>
                  <div className="absolute-row right btns xs">
                    <button className="btn icon primary" onClick={() => this.onEdit(item.id, i)}>{icon.pencil()}</button>
                    <button className="btn icon red" onClick={() => this.onDeleteRequest(item.id, i)}>{icon.close()}</button>
                  </div>
                </div>
              </li>
            )}
          </ul>}
        </li>
      )
    );

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
                  <div className="col">Nid</div>
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