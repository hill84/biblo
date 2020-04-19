import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { auth, authorFollowerRef, collectionFollowersRef, commentersGroupRef, countRef, followersGroupRef, genreFollowerRef, noteRef, notesRef, reviewerCommenterRef, reviewerRef, reviewersGroupRef, userNotificationsRef, userRef, usersRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { asyncForEach, dateOptions, getInitials, handleFirestoreError, timeOptions } from '../../../config/shared';
import { funcType } from '../../../config/types';
import SnackbarContext from '../../../context/snackbarContext';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

const limitBy = [ 15, 25, 50, 100, 250, 500 ];

const orderBy = [ 
  { type: 'creationTime', label: 'Data'}, 
  { type: 'displayName', label: 'Nome'}, 
  { type: 'uid', label: 'Uid'}, 
  { type: 'email', label: 'Email'},
  { type: 'stats.shelf_num', label: 'Libri'},
  { type: 'stats.wishlist_num', label: 'Desideri'},
  { type: 'stats.reviews_num', label: 'Recensioni'},
  { type: 'stats.ratings_num', label: 'Voti'}
];

const unsub = {
  usersFetch: null
};

const initialState = {
  firstVisible: null,
  items: null,
  lastVisible: null,
  limitByIndex: 0,
  orderByIndex: 0,
  page: 1
};

const UsersDash = props => {
  const { openSnackbar } = useContext(SnackbarContext);
  const { onToggleDialog, onToggleNoteDialog } = props;
  const [state, setState] = useState(initialState);
  const [count, setCount] = useState(0);
  const [desc, setDesc] = useState(true);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState(null);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);
  const [selected, setSelected] = useState(null);
  const { firstVisible, items, lastVisible, limitByIndex, orderByIndex, page } = state;
  const is = useRef(true);

  const limit = useMemo(() => limitBy[limitByIndex], [limitByIndex]);

  const onDeleteSuccess = useCallback(msg => {
    console.log(`%c✔ ${msg} deleted`, 'color: green');
    openSnackbar(`${msg} deleted`, 'success');
  }, [openSnackbar]);

  const onDeleteError = useCallback((msg, err) => {
    console.log(`%c✖ ${msg} not deleted`, 'color: red');
    openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const fetch = useCallback(e => {
    const direction = e?.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const ref = usersRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const dRef = direction ? paginatedRef : ref;

    if (is.current) setLoading(true);

    const fetcher = () => {
      unsub.usersFetch = dRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          if (is.current) {
            setState({
              ...state,
              firstVisible: snap.docs[prev ? snap.size - 1 : 0],
              items: prev ? items.reverse() : items,
              lastVisible: snap.docs[prev ? 0 : snap.size - 1],
              page: direction ? prev ? state.page - 1 : ((state.page * limit) > state.count) ? state.page : state.page + 1 : 1
            });
            setLoading(false);
          }
        } else if (is.current) {
          setState(initialState);
          setLoading(false);
        }
      }, err => console.warn(err));
    };
    
    if (!direction) {
      countRef('users').get().then(fullSnap => {
        if (fullSnap.exists) {
          if (is.current) {
            setCount(fullSnap.data().count);
            fetcher();
          }
        } else if (is.current) {
          setCount(0);
          setState(initialState);
        }
      }).catch(err => {
        openSnackbar(handleFirestoreError(err), 'error');
      }).finally(() => {
        if (is.current) setLoading(false);
      });
    } else fetcher();
  }, [desc, firstVisible, lastVisible, limit, openSnackbar, orderByIndex, state]);
  
  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [desc, limitByIndex, orderByIndex]);

  useEffect(() => () => {
    is.current = false;
    unsub.usersFetch && unsub.usersFetch();
  }, []);

  const onToggleDesc = () => setDesc(!desc);
  
  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);
  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);
  const onChangeOrderBy = (e, i) => {
    setOrderMenuAnchorEl(null);
    setState({ ...state, orderByIndex: i, page: 1 });
  };

  const onOpenLimitMenu = e => setLimitMenuAnchorEl(e.currentTarget);
  const onCloseLimitMenu = () => setLimitMenuAnchorEl(null);
  const onChangeLimitBy = (e, i) => {
    setLimitMenuAnchorEl(null);
    setState({ ...state, limitByIndex: i, page: 1 });
  };

  const onView = e => {
    const { uid } = e.currentTarget?.parentNode?.dataset;
    setRedirectTo(uid);
  };

  const onNote = e => {
    const { uid } = e.currentTarget?.parentNode?.dataset;
    onToggleNoteDialog(uid);
  };

  const onSendReset = e => {
    const { email } = e.currentTarget?.parentNode?.dataset;
    auth.sendPasswordResetEmail(email).then(() => {
      openSnackbar(`Email inviata`, 'success');
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  };

  // const onSendVerification = () => {}; // TODO

  const onEdit = item => onToggleDialog(item);

  const onLock = e => {
    const { uid } = e.currentTarget?.parentNode?.dataset;
    const state = e.currentTarget?.parentNode?.dataset.state === 'true';
    // console.log(`${state ? 'Un' : 'L'}ocking ${id}`);
    userRef(uid).update({ 'roles.editor': !state }).then(() => {
      openSnackbar(`Elemento ${state ? '' : 's'}bloccato`, 'success');
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  };

  const onDeleteRequest = e => {
    const { displayName, email, uid } = e.currentTarget?.parentNode?.dataset;
    
    if (is.current) {
      setIsOpenDeleteDialog(true);
      setSelected({ displayName, email, uid });
    }
  };
  const onCloseDeleteDialog = () => {
    setIsOpenDeleteDialog(false);
    setSelected(null)
  };
  const onDelete = useCallback(() => {
    if (is.current) setIsOpenDeleteDialog(false);

    const { uid } = selected;
    
    userRef(uid).delete().then(() => onDeleteSuccess('User')).catch(err => onDeleteError('User', err));

    reviewersGroupRef.where('createdByUid', '==', uid).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => {
          // console.log(`• review deleted`);
          const { bid, createdByUid } = item.data();
          reviewerRef(bid, createdByUid).delete().catch(err => onDeleteError(`Review ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} reviews`);
      }
    }).catch(err => onDeleteError('Reviews', err));

    commentersGroupRef.where('createdByUid', '==', uid).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => {
          // console.log(`• comment deleted`);
          const { bid, createdByUid, rid } = item.data();
          reviewerCommenterRef(bid, rid, createdByUid).delete().catch(err => onDeleteError(`Comment ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} comments`);
      }
    }).catch(err => onDeleteError('Comments', err));

    followersGroupRef.where('uid', '==', uid).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => {
          const { aid, cid, gid, uid } = item.data();
          // console.log(`• ${aid ? 'author' : cid ? 'collection' : gid ? 'genre' : 'unknow'} deleted`);
          if (aid) authorFollowerRef(aid, uid).delete().catch(err => onDeleteError(`Author follow ${item.id}`, err));
          if (gid) genreFollowerRef(gid, uid).delete().catch(err => onDeleteError(`Genre follow ${item.id}`, err));
          if (cid) collectionFollowersRef(cid).doc(uid).delete().catch(err => onDeleteError(`Collection follow ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} follows`);
      }
    }).catch(err => onDeleteError('Follows', err));

    userNotificationsRef(uid).get().then(snap => {
      if (!snap.empty) {
        notesRef(uid).get().then(snap => {
          if (!snap.empty) {
            if (snap.docs.length < 1000) {
              const notes = [];
              snap.forEach(item => notes.push(item.id));
              // console.log(notes);
              (async () => {
                await asyncForEach((snap, item) => {
                  noteRef(uid, item.id).delete().then(() => {
                    // console.log(`• note ${item.id} deleted`);
                  }).catch(err => onDeleteError(`• note ${item.id}`, err));
                });

                onDeleteSuccess(`${snap.docs.length} notes`);

                userNotificationsRef(uid).delete().then(() => {
                  onDeleteSuccess('Notifications collection');
                }).catch(err => onDeleteError('Notifications collection', err));
              })();
            } else console.warn('Operation aborted: too many docs');
          } else console.log('No notes');
        }).catch(err => onDeleteError('Notes', err));
      } else console.log('No notifications collection');
    }).catch(err => onDeleteError('Notifications', err));
    
    onCloseDeleteDialog();
  }, [onDeleteError, onDeleteSuccess, selected]);

  const onChangeRole = e => {
    const { uid } = e.currentTarget?.parentNode?.dataset;
    const { role } = e.currentTarget?.dataset;
    const state = e.currentTarget?.dataset.state === 'true';
    userRef(uid).update({ [`roles.${role}`]: !state }).catch(err => console.warn(err));
  };

  if (redirectTo) return <Redirect to={`/dashboard/${redirectTo}`} />
  
  const orderByOptions = orderBy.map((option, index) => (
    <MenuItem
      key={option.type}
      disabled={index === -1}
      selected={index === orderByIndex}
      onClick={e => onChangeOrderBy(e, index)}>
      {option.label}
    </MenuItem>
  ));
  
  const limitByOptions = limitBy.map((option, index) => (
    <MenuItem
      key={option}
      disabled={index === -1}
      selected={index === limitByIndex}
      onClick={e => onChangeLimitBy(e, index)}>
      {option}
    </MenuItem>
  ));
  
  const skeletons = [...Array(limit)].map((e, i) => <li key={i} className="avatar-row skltn dash" />);
  
  const itemsList = loading ? skeletons : !items ? <li className="empty text-center">Nessun elemento</li> : (
    items.map(item => (
      <li key={item.uid} className={`avatar-row ${item.roles?.editor ? 'editor' : 'locked'}`}>
        <div className="row">
          <div className="col-auto avatar-container">
            <Avatar className="avatar">
              {item.photoURL ? 
                <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                  <img alt={item.displayName} src={item.photoURL} className="avatar thumb" />
                </Zoom>
              : getInitials(item.displayName)}
            </Avatar>
          </div>
          <Link to={`/dashboard/${item.uid}`} className="col col-lg-2" title={item.displayName}>
            {item.displayName} {item.roles?.author && icon.checkDecagram}
          </Link>
          <div className="col monotype hide-sm">
            <CopyToClipboard text={item.uid} />
          </div>
          <div className="col monotype hide-sm">
            <CopyToClipboard text={item.email} />
          </div>
          <div role="group" className="col col-md-2 col-lg-1 btns xs rounded text-center" data-uid={item.uid}>
            <button type="button" className={`btn ${item.roles?.editor ? '' : 'flat'}`} data-role="editor" onClick={onChangeRole} title="editor">E</button>
            <button type="button" className={`btn ${item.roles?.premium ? '' : 'flat'}`} data-role="premium" onClick={onChangeRole} title="premium">P</button>
            <button type="button" className={`btn ${item.roles?.admin ? '' : 'flat'}`} data-role="admin" onClick={onChangeRole} title="admin">A</button>
          </div>
          <div className="col col-sm-3 hide-xs">
            <div className="row text-center monotype">
              <div className={`col ${!item.stats?.shelf_num && 'lightest-text'}`}>{item.stats?.shelf_num}</div>
              <div className={`col ${!item.stats?.wishlist_num && 'lightest-text'}`}>{item.stats?.wishlist_num}</div>
              <div className={`col ${!item.stats?.reviews_num && 'lightest-text'}`}>{item.stats?.reviews_num}</div>
              <div className={`col hide-md ${!item.stats?.ratings_num && 'lightest-text'}`}>{item.stats?.ratings_num}</div>
              <div className={`col hide-md ${!item.termsAgreement && 'lightest-text'}`} title={item.termsAgreement && new Date(item.termsAgreement).toLocaleString()}>{icon[item.termsAgreement ? 'check' : 'close']}</div>
              <div className={`col hide-md ${!item.privacyAgreement && 'lightest-text'}`} title={item.privacyAgreement && new Date(item.privacyAgreement).toLocaleString()}>{icon[item.privacyAgreement ? 'check' : 'close']}</div>
            </div>
          </div>
          <div className="col col-sm-2 col-lg-1 text-right">
            <div className="timestamp">
              <span className="date">{new Date(item.creationTime).toLocaleDateString('it-IT', dateOptions)}</span><span className="time hide-lg"> &middot; {new Date(item.creationTime).toLocaleTimeString('it-IT', timeOptions)}</span>
            </div>
          </div>
          <div className="absolute-row right btns xs"
            data-display-name={item.displayName}
            data-email={item.email}
            data-state={item.roles?.editor}
            data-uid={item.uid}>
            <button
              type="button"
              className="btn icon green"
              title="anteprima"
              onClick={onView}>
              {icon.eye}
            </button>
            <button
              type="button"
              className="btn icon primary"
              title="modifica"
              onClick={() => onEdit(item)}>
              {icon.pencil}
            </button>
            <button
              type="button"
              className="btn icon primary"
              title="Invia notifica"
              onClick={onNote}>
              {icon.bell}
            </button>
            {/* 
              <button
                type="button"
                className="btn icon primary"
                title="Invia email di verifica"
                onClick={onSendVerification}>
                {icon.email}
              </button>
            */}
            <button
              type="button"
              className="btn icon primary"
              title="Invia email di reset password"
              onClick={onSendReset}>
              {icon.textboxPassword}
            </button>
            <button
              type="button"
              className={`btn icon ${item.roles?.editor ? 'secondary' : 'flat' }`}
              title={item.roles?.editor ? 'Blocca' : 'Sblocca'}
              onClick={onLock}>
              {icon.lock}
            </button>
            <button
              type="button"
              className="btn icon red"
              onClick={onDeleteRequest}
              title="elimina">
              {icon.close}
            </button>
          </div>
        </div>
      </li>
    ))
  );

  return (
    <>
      <div className="head nav" ref={is}>
        <div className="row">
          <div className="col">
            <span className="counter hide-md">{`${items?.length || 0} di ${count || 0}`}</span>
            <button type="button" className="btn sm flat counter last" onClick={onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
            <Menu 
              className="dropdown-menu"
              anchorEl={limitMenuAnchorEl} 
              open={Boolean(limitMenuAnchorEl)} 
              onClose={onCloseLimitMenu}>
              {limitByOptions}
            </Menu>
          </div>
          <div className="col-auto">
            <button type="button" className="btn sm flat counter" onClick={onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
            <button type="button" className={`btn sm flat counter icon rounded ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={onToggleDesc}>{icon.arrowDown}</button>
            <Menu 
              className="dropdown-menu"
              anchorEl={orderMenuAnchorEl} 
              open={Boolean(orderMenuAnchorEl)} 
              onClose={onCloseOrderMenu}>
              {orderByOptions}
            </Menu>
          </div>
        </div>
      </div>

      <ul className="table dense nolist font-sm">
        <li className="avatar-row labels">
          <div className="row">
            <div className="col-auto"><div className="avatar hidden" title="avatar" /></div>
            <div className="col col-lg-2">Nominativo</div>
            <div className="col hide-sm">Uid</div>
            <div className="col hide-sm">Email</div>
            <div className="col col-md-2 col-lg-1 text-center">Ruoli</div>
            <div className="col col-sm-3 hide-xs">
              <div className="row text-center">
                <div className="col" title="Libri">{icon.book}</div>
                <div className="col" title="Desideri">{icon.heart}</div>
                <div className="col" title="Recensioni">{icon.review}</div>
                <div className="col hide-md" title="Voti">{icon.star}</div>
                <div className="col hide-md" title="Termini">{icon.clipboardCheck}</div>
                <div className="col hide-md" title="Privacy">{icon.shieldAccount}</div>
              </div>
            </div>
            <div className="col col-sm-2 col-lg-1 text-right">Creato</div>
          </div>
        </li>
        {itemsList}
      </ul>
      
      <PaginationControls 
        count={count} 
        fetch={fetch}
        forceVisibility
        limit={limit}
        page={page}
      />

      {selected && (
        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Cancellando l&apos;utente <b>{selected.displayName}</b> <small className="monotype">({selected.uid})</small> verranno rimosse anche la sua libreria e le sue notifiche.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

UsersDash.propTypes = {
  onToggleDialog: funcType.isRequired,
  onToggleNoteDialog: funcType.isRequired
}
 
export default UsersDash;