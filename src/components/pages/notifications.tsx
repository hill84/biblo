import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import React, { FC, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { notesRef, notificationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import { NoteModel, OrderByModel } from '../../types';
import NoteMenuItem from '../noteMenuItem';
import PaginationControls from '../paginationControls';
import { skltn_notification } from '../skeletons';

const limit = 10;

const orderBy: OrderByModel[] = [ 
  { type: 'created_num', label: 'Data'}, 
  { type: 'read', label: 'Lettura'},
  { type: 'createdByUid', label: 'Mittente'}
];

interface StateModel {
  count: number;
  desc: boolean;
  items: NoteModel[];
  lastVisible: DocumentData | null;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl: Element | null;
  page: number;
}

const initialState: StateModel = {
  count: 0,
  desc: true,
  items: [],
  lastVisible: null,
  loading: false,
  orderByIndex: 0,
  orderMenuAnchorEl: null,
  page: 1,
};

const Notifications: FC = () => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [count, setCount] = useState<number>(initialState.count);
  const [desc, setDesc] = useState<boolean>(initialState.desc);
  const [items, setItems] = useState<NoteModel[] | null>(initialState.items);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(initialState.lastVisible);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [orderByIndex, setOrderByIndex] = useState<number>(initialState.orderByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<Element | null>(initialState.orderMenuAnchorEl);
  const [page, setPage] = useState<number>(initialState.page);

  const authid: string = user?.uid || '';

  const fetch = useCallback(() => {
    if (authid) {
      const items: NoteModel[] = [];
      const ref: Query<DocumentData> = notesRef(authid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
      const setEmptyState = (): void => {
        setCount(initialState.count);
        setItems(initialState.items);
        setPage(initialState.page);
      };
      
      setLoading(true);
      ref.limit(limit).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          snap.forEach((item: DocumentData): number => items.push(item.data()));
          setItems(items);
          setLastVisible(snap.docs[snap.docs.length-1]);
          setPage(initialState.page);
          notificationsRef.doc(authid).get().then((snap: DocumentData): void => {
            if (snap.exists) {
              setCount(snap.data().count);
            }
          }).catch((err: FirestoreError): void => {
            setEmptyState();
            openSnackbar(handleFirestoreError(err), 'error');
          });
        } else {
          setEmptyState();
        }
      }).catch((err: FirestoreError): void => {
        setEmptyState();
        openSnackbar(handleFirestoreError(err), 'error');
      }).finally((): void => {
        setLoading(false);
      });
    }
  }, [desc, openSnackbar, orderByIndex, authid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const fetchNext = (): void => {
    if (authid) {
      const ref: Query<DocumentData> = notesRef(authid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');

      setLoading(true);

      ref.startAfter(lastVisible).limit(limit).get().then((nextSnap: DocumentData): void => {
        if (!nextSnap.empty) {
          const items: NoteModel[] = [];
          nextSnap.forEach((item: DocumentData): number => items.push(item.data()));
          setItems(items);
          setPage((page * limit) > count ? page : page + 1);
          setLastVisible(nextSnap.docs[nextSnap.docs.length-1] || lastVisible);
        } else {
          setItems(initialState.items);
          setPage(initialState.page);
          setLastVisible(initialState.lastVisible);
        }
      }).catch((err: FirestoreError): void => {
        openSnackbar(handleFirestoreError(err), 'error');
      }).finally((): void => {
        setLoading(false);
      });
    }
  };

  const onChangeOrderBy = (_e: MouseEvent, i: number): void => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
  };

  const onToggleDesc = (): void => setDesc(!desc);

  const onOpenOrderMenu = (e: MouseEvent): void => setOrderMenuAnchorEl(e.currentTarget);

  const onCloseOrderMenu = (): void => setOrderMenuAnchorEl(null);

  const skltn = skltn_notification(limit);
  const orderByOptions = orderBy.map((option: OrderByModel, i: number) => (
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
      <div className='reviews'>
        <div className='info-row empty text-center pad-v'>
          <p>Non ci sono notifiche</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container' id='notificationsComponent'>
      <Helmet>
        <title>{app.name} | Notifiche</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
        
      <div className='card light'>
        <div className='collection hoverable-items'>
          <div className='head nav'>
            <div className='row'>
              <div className='col'>
                <span className='counter'>
                  {items ? items.length : 0} notific{items?.length === 1 ? 'a' : 'he'} {items && count > items.length ? `di ${count}` : ''}
                </span>
              </div>
              <div className='col-auto'>
                <button
                  type='button'
                  className='btn sm flat counter'
                  onClick={onOpenOrderMenu}
                  disabled={!items || items.length < 2}>
                  <span className='hide-xs'>Ordina per</span> {orderBy[orderByIndex].label}
                </button>
                <button
                  type='button'
                  className={classnames('btn', 'sm', 'flat', 'counter', 'icon', desc ? 'desc' : 'asc')}
                  title={desc ? 'Ascendente' : 'Discendente'}
                  onClick={onToggleDesc}
                  disabled={!items || items.length < 2}>
                  {icon.arrowDown}
                </button>
                <Menu 
                  className='dropdown-menu'
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
              </div>
            </div>
          </div>
          <div className='shelf notes'>
            {loading ? skltn : items?.map((item: NoteModel) => (
              <NoteMenuItem item={item} key={item.nid} animation={false} />
            ))}
          </div>
        </div>
      </div>

      {count > 0 && (items?.length || 0) < count && (
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      )}
    </div>
  );
};
 
export default Notifications;