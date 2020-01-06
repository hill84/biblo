import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { notesRef, notificationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType } from '../../config/types';
import UserContext from '../../context/userContext';
import NoteMenuItem from '../noteMenuItem';
import PaginationControls from '../paginationControls';
import { skltn_notification } from '../skeletons';

const limit = 10;
const orderBy = [ 
  { type: 'created_num', label: 'Data'}, 
  { type: 'read', label: 'Lettura'},
  { type: 'createdByUid', label: 'Mittente'}
];

const Notifications = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = props;
  const [count, setCount] = useState(0);
  const [desc, setDesc] = useState(true);
  const [items, setItems] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderByIndex, setOrderByIndex] = useState(0);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const is = useRef(true);

  const fetch = useCallback(() => {
    const items = [];
    const ref = notesRef(user.uid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
    const setEmptyState = () => {
      setCount(0);
      setItems(null);
      setLoading(false);
      setPage(1);
    };

    if (is.current) setLoading(true);

    ref.limit(limit).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setLastVisible(snap.docs[snap.docs.length-1]);
          setLoading(false);
          setPage(1);
        }
        notificationsRef.doc(user.uid).get().then(snap => {
          if (snap.exists) {
            if (is.current) {
              setCount(snap.data().count);
            }
          }
        }).catch(err => {
          if (is.current) {
            setEmptyState();
            openSnackbar(handleFirestoreError(err), 'error');
          }
        });
      } else if (is.current) {
        setEmptyState();
      }
    }).catch(err => {
      if (is.current) {
        setEmptyState();
        openSnackbar(handleFirestoreError(err), 'error');
      }
    });
  }, [desc, openSnackbar, orderByIndex, user.uid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const fetchNext = () => {
    const ref = notesRef(user.uid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');

    if (is.current) setLoading(true);

    ref.startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setLoading(false);
          setPage((page * limit) > count ? page : page + 1);
          setLastVisible(nextSnap.docs[nextSnap.docs.length-1] || lastVisible);
        }
      } else if (is.current) {
        setItems(null);
        setLoading(false);
        setPage(null);
        setLastVisible(null);
      }
    }).catch(err => {
      setLoading(false);
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }

  const onChangeOrderBy = (e, i) => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
  };

  const onToggleDesc = () => setDesc(!desc);

  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);

  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);

  const skltn = skltn_notification(limit);
  const orderByOptions = orderBy.map((option, i) => (
    <MenuItem
      key={option.type}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={e => onChangeOrderBy(e, i)}>
      {option.label}
    </MenuItem>
  ));

  if (!items && !loading) { 
    return (
      <div className="reviews">
        <div className="info-row empty text-center pad-v">
          <p>Non ci sono notifiche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="notificationsComponent">
      <Helmet>
        <title>{app.name} | Notifiche</title>
        <link rel="canonical" href={app.url} />
      </Helmet>
        
      <div className="card light" ref={is}>
        <div className="collection hoverable-items">
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter">{items ? items.length : 0} notific{items && items.length === 1 ? 'a' : 'he'} {items && count > items.length ? `di ${count}` : ''}</span>
              </div>
              <div className="col-auto">
                <button type="button" className="btn sm flat counter" onClick={onOpenOrderMenu} disabled={!items || items.length < 2}>
                  <span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}
                </button>
                <button type="button" className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={onToggleDesc} disabled={!items || items.length < 2}>
                  {icon.arrowDown}
                </button>
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
          <div className="shelf notes">
            {loading ? skltn : items.map(item => <NoteMenuItem item={item} key={item.nid} animation={false} />) }
          </div>
        </div>
      </div>

      {count > 0 && items && items.length < count &&
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      }
    </div>
  );
}

Notifications.propTypes = {
  openSnackbar: funcType.isRequired
}
 
export default Notifications;