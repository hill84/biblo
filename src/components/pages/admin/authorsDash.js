import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import Zoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { authorRef, authorsRef, countRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { app, getInitials, handleFirestoreError, normalizeString, normURL, timeSince } from '../../../config/shared';
import { boolType, funcType } from '../../../config/types';
import SnackbarContext from '../../../context/snackbarContext';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

const limitBy = [ 15, 25, 50, 100, 250, 500];

const orderBy = [ 
  { type: 'lastEdit_num', label: 'Data ultima modifica' }, 
  { type: 'lastEditByUid', label: 'Modificato da' },
  { type: 'displayName', label: 'Nominativo' }, 
  { type: 'sex', label: 'Sesso' },
  { type: 'photoURL', label: 'Foto' }
];

const unsub = {
  authorsFetch: null
};

const AuthorsDash = props => {
  const { openSnackbar } = useContext(SnackbarContext);
  const { inView, onToggleDialog } = props;
  const [count, setCount] = useState(0);
  const [desc, setDesc] = useState(true);
  const [firstVisible, setFirstVisible] = useState(null);
  const [items, setItems] = useState(null);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState(null);
  const [limitByIndex, setLimitByIndex] = useState(0);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [orderByIndex, setOrderByIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [redirectTo, setRedirectTo] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const is = useRef(true);

  const limit = useMemo(() => limitBy[limitByIndex], [limitByIndex]);

  const fetch = useCallback(e => {
    const direction = e?.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const ref = authorsRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const dRef = direction ? paginatedRef : ref;

    if (is.current) setLoading(true);

    const fetcher = () => {
      unsub.authorsFetch = dRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          setFirstVisible(snap.docs[prev ? snap.size - 1 : 0]);
          setItems(prev ? items.reverse() : items);
          setLastVisible(snap.docs[prev ? 0 : snap.size - 1]);
          setPage(direction ? prev ? page - 1 : ((page * limit) > count) ? page : page + 1 : 1);
          setLoading(false);
        } else {
          setFirstVisible(null);
          setItems(null); 
          setLastVisible(null);
          setPage(1);
          setLoading(false);
        }
      }, err => console.warn(err));
    };
    
    if (!direction) {
      countRef('authors').get().then(fullSnap => {
        if (fullSnap.exists) {
          if (is.current) {
            setCount(fullSnap.data().count);
            fetcher();
          }
        } else if (is.current) {
          setCount(0);
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else fetcher();
  }, [count, desc, firstVisible, lastVisible, limit, openSnackbar, orderByIndex, page]);

  useEffect(() => {
    if (inView) fetch();
    // eslint-disable-next-line
  }, [inView, desc, limitByIndex, orderByIndex]);

  useEffect(() => () => {
    is.current = false;
    unsub.authorsFetch && unsub.authorsFetch();
  }, []);

  const onToggleDesc = () => setDesc(!desc);

  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);
  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);
  const onChangeOrderBy = (e, i) => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
    setPage(1);
  };

  const onOpenLimitMenu = e => setLimitMenuAnchorEl(e.currentTarget);
  const onCloseLimitMenu = () => setLimitMenuAnchorEl(null);
  const onChangeLimitBy = (e, i) => {
    setLimitByIndex(i);
    setLimitMenuAnchorEl(null);
    setPage(1);
  };

  const onView = id => setRedirectTo(id);

  const onEdit = id => onToggleDialog(id);

  const onLock = (id, state) => {
    if (id) {
      if (state) {
        // console.log(`Locking ${id}`);
        authorRef(id).update({ edit: false }).then(() => {
          openSnackbar('Elemento bloccato', 'success');
        }).catch(error => console.warn(error));
      } else {
        // console.log(`Unlocking ${id}`);
        authorRef(id).update({ edit: true }).then(() => {
          openSnackbar('Elemento sbloccato', 'success');
        }).catch(error => console.warn(error));
      }
    }
  };

  const onDeleteRequest = id => {
    setIsOpenDeleteDialog(true);
    setSelectedId(id);
  };
  const onCloseDeleteDialog = () => {
    setIsOpenDeleteDialog(false);
    setSelectedId(null);
  };
  const onDelete = () => {
    // console.log(`Deleting ${selectedId}`);
    authorRef(selectedId).delete().then(() => {
      setIsOpenDeleteDialog(false);
      openSnackbar('Elemento cancellato', 'success');
    }).catch(err => console.warn(err));
  };

  const skeletons = useMemo(() => [...Array(limit)].map((e, i) => <li key={i} className="skltn dash" />), [limit]);

  if (redirectTo) return <Redirect to={`/author/${redirectTo}`} />
    
  const orderByOptions = orderBy.map((option, index) => (
    <MenuItem
      key={option.type}
      disabled={index === -1}
      selected={index === orderByIndex}
      onClick={event => onChangeOrderBy(event, index)}>
      {option.label}
    </MenuItem>
  ));

  const limitByOptions = limitBy.map((option, index) => (
    <MenuItem
      key={option}
      disabled={index === -1}
      selected={index === limitByIndex}
      onClick={event => onChangeLimitBy(event, index)}>
      {option}
    </MenuItem>
  ));

  const itemsList = loading ? skeletons : !items ? <li className="empty text-center">Nessun elemento</li> : (
    items.map(item => (
      <li key={item.displayName} className={`avatar-row ${item.edit ? '' : 'locked'}`}>
        <div className="row">
          <div className="col-auto hide-xs avatar-container">
            <Avatar className="avatar">
              {item.photoURL ? 
                <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                  <img alt={item.displayName} src={item.photoURL} className="avatar thumb" />
                </Zoom>
              : getInitials(item.displayName)}
            </Avatar>
          </div>
          <div className="col-6 col-sm-4 col-lg-2" title={item.displayName}><CopyToClipboard text={item.displayName}/></div>
          <div className="col-1"><button type="button" className="btn xs flat" title={item.sex === 'm' ? 'uomo' : 'donna'}>{item.sex}</button></div>
          <div className="col hide-lg" title={item.bio}>{item.bio}</div>
          <Link to={`/dashboard/${item.lastEditByUid}`} title={item.lastEditByUid} className="col col-sm-2 col-lg-1">{item.lastEditBy}</Link>
          <div className="col col-sm-2 col-lg-1 text-right">
            <div className="timestamp">{timeSince(item.lastEdit_num)}</div>
          </div>
          <div className="absolute-row right btns xs">
            <button type="button" className="btn icon green" onClick={() => onView(normURL(item.displayName))}>{icon.eye}</button>
            <button type="button" className="btn icon primary" onClick={() => onEdit(normalizeString(item.displayName))}>{icon.pencil}</button>
            <button type="button" className={`btn icon ${item.edit ? 'secondary' : 'flat' }`} onClick={() => onLock(normalizeString(item.displayName), item.edit)} title={item.edit ? 'Blocca' : 'Sblocca'}>{icon.lock}</button>
            <button type="button" className="btn icon red" onClick={() => onDeleteRequest(normalizeString(item.displayName))}>{icon.close}</button>
          </div>
        </div>
      </li>
    ))
  );

  const sitemapData = items?.map(item => ([
    `<url> <loc>${app.url}/author/${normURL(item.displayName)}</loc> </url>`
  ]));

  return (
    <>
      <div className="head nav">
        <div className="row">
          <div className="col">
            <span className="counter hide-md">{`${items ? items.length : 0} di ${count || 0}`}</span>
            <button type="button" className="btn sm flat counter last" onClick={onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
            <Menu 
              className="dropdown-menu"
              anchorEl={limitMenuAnchorEl} 
              open={Boolean(limitMenuAnchorEl)} 
              onClose={onCloseLimitMenu}>
              {limitByOptions}
            </Menu>
          </div>
          {items && (
            <div className="col-auto">
              <CSVLink data={sitemapData} className="counter" filename="sitemap_authors.csv">Sitemap</CSVLink>
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
          )}
        </div>
      </div>
      
      <ul className="table dense nolist font-sm">
        <li className="avatar-row labels">
          <div className="row">
            <div className="col-auto hide-xs"><div className="avatar hidden" title="avatar" /></div>
            <div className="col-6 col-sm-4 col-lg-2">Nominativo</div>
            <div className="col-1">Sesso</div>
            <div className="col hide-lg">Bio</div>
            <div className="col col-sm-2 col-lg-1">Modificato da</div>
            <div className="col col-sm-2 col-lg-1 text-right">Modificato</div>
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

      {isOpenDeleteDialog && (
        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

AuthorsDash.propTypes = {
  inView: boolType.isRequired,
  onToggleDialog: funcType.isRequired
}

export default AuthorsDash;