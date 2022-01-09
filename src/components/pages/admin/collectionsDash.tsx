import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link, Redirect } from 'react-router-dom';
import { collectionBooksRef, collectionRef, collectionsRef, countRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { app, handleFirestoreError, normURL, timeSince } from '../../../config/shared';
import SnackbarContext from '../../../context/snackbarContext';
import useToggle from '../../../hooks/useToggle';
import { BookModel, CollectionModel, CurrentTarget, OrderByModel } from '../../../types';
import PaginationControls from '../../paginationControls';

const limitBy: number[] = [15, 25, 50, 100, 250, 500];

const orderBy: OrderByModel[] = [ 
  { type: 'lastEdit_num', label: 'Data ultima modifica' },
  { type: 'lastEditByUid', label: 'Modificato da' },
  { type: 'title', label: 'Titolo' },
  { type: 'books_num', label: 'Libri' },
];

let itemsFetch: (() => void) | undefined;

interface CollectionsDashProps {
  onToggleDialog: (id?: string) => void;
}

interface StateModel {
  count: number;
  desc: boolean;
  firstVisible: DocumentData | null;
  isOpenDeleteDialog: boolean;
  items: CollectionModel[];
  lastVisible: DocumentData | null;
  limitByIndex: number;
  limitMenuAnchorEl?: Element;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl?: Element;
  page: number;
  redirectTo: string;
  selectedId: string;
}

const initialState: StateModel = {
  count: 0,
  desc: false,
  firstVisible: null,
  isOpenDeleteDialog: false,
  items: [],
  lastVisible: null,
  limitByIndex: 0,
  limitMenuAnchorEl: undefined,
  loading: true,
  orderByIndex: 0,
  orderMenuAnchorEl: undefined,
  page: 1,
  redirectTo: '',
  selectedId: '',
};

const CollectionsDash: FC<CollectionsDashProps> = ({ onToggleDialog }: CollectionsDashProps) => {
  const [count, setCount] = useState<StateModel['count']>(initialState.count);
  const [desc, onToggleDesc] = useToggle(initialState.desc);
  const [firstVisible, setFirstVisible] = useState<StateModel['firstVisible']>(initialState.firstVisible);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<StateModel['isOpenDeleteDialog']>(initialState.isOpenDeleteDialog);
  const [items, setItems] = useState<StateModel['items']>(initialState.items);
  const [lastVisible, setLastVisible] = useState<StateModel['lastVisible']>(initialState.lastVisible);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState<StateModel['limitMenuAnchorEl']>(initialState.limitMenuAnchorEl);
  const [limitByIndex, setLimitByIndex] = useState<number>(initialState.limitByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);
  const [redirectTo, setRedirectTo] = useState<StateModel['redirectTo']>(initialState.redirectTo);
  const [selectedId, setSelectedId] = useState<StateModel['selectedId']>(initialState.selectedId);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading);

  const { openSnackbar } = useContext(SnackbarContext);

  const limit: number = limitBy[limitByIndex];
  const order: OrderByModel = orderBy[orderByIndex];

  const fetcher = useCallback(() => {
    const ref: Query<DocumentData> = collectionsRef.orderBy(order.type, desc ? 'desc' : 'asc').limit(limit);

    setLoading(true);
    itemsFetch = ref.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: CollectionModel[] = [];
        snap.forEach((item: DocumentData): number => items.push(item.data()));
        setFirstVisible(snap.docs[0]);
        setItems(items);
        setLastVisible(snap.docs[snap.size - 1]);
      } else {
        setFirstVisible(initialState.firstVisible);
        setItems(initialState.items);
        setLastVisible(initialState.lastVisible);
      }
      setLoading(false);
      setPage(initialState.page);
    }, (err: Error): void => {
      console.warn(err);
    });
  }, [desc, limit, order.type]);

  const fetch = (e: MouseEvent): void => {
    const prev: boolean = (e.currentTarget as CurrentTarget).dataset?.direction === 'prev';
    const ref: Query<DocumentData> = collectionsRef.orderBy(order.type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef: Query<DocumentData> = ref.startAfter(prev ? firstVisible : lastVisible);

    itemsFetch = paginatedRef.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: CollectionModel[] = [];
        snap.forEach((item: DocumentData): void => {
          const books: BookModel[] = [];
          collectionBooksRef(item.id).orderBy('bcid', 'desc').get().then((snap: DocumentData): void => {
            if (!snap.empty) {
              snap.forEach((book: DocumentData): number => books.push(book.data().bid));
            }
          });
          items.push({ ...item.data(), title: item.id, books });
        });
        setFirstVisible(snap.docs[prev ? snap.size - 1 : 0]);
        setItems(prev ? items.reverse() : items);
        setLastVisible(snap.docs[prev ? 0 : snap.size - 1]);
        setPage(prev ? page - 1 : ((page * limit) > count) ? page : page + 1);
      } else {
        setFirstVisible(initialState.firstVisible);
        setItems(initialState.items);
        setPage(initialState.page);
        setLastVisible(initialState.lastVisible);
      }
      setLoading(false);
    }, (err: Error): void => {
      console.warn(err);
    });
  };

  useEffect(() => {
    countRef('collections').get().then((fullSnap: DocumentData): void => {
      if (fullSnap.exists) {
        setCount(fullSnap.data()?.count);
        fetcher();
      } else {
        setCount(initialState.count);
      }
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }, [fetcher, openSnackbar]);

  useEffect(() => () => {
    itemsFetch?.();
  }, []);

  const onOpenOrderMenu = (e: MouseEvent): void => setOrderMenuAnchorEl(e.currentTarget);
  const onChangeOrderBy = (i: number): void => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(undefined);
    setPage(initialState.page);
  };
  const onCloseOrderMenu = (): void => setOrderMenuAnchorEl(undefined);

  const onOpenLimitMenu = (e: MouseEvent): void => setLimitMenuAnchorEl(e.currentTarget);
  const onChangeLimitBy = (i: number): void => {
    setLimitByIndex(i);
    setLimitMenuAnchorEl(undefined);
    setPage(initialState.page);
  };
  const onCloseLimitMenu = (): void => setLimitMenuAnchorEl(undefined);

  const onView = ({ id }: { id: string }): void => setRedirectTo(normURL(id));

  const onEdit = ({ id }: { id: string }): void => onToggleDialog(id);

  const onLock = ({ id, state }: { id: string; state: boolean }): void => {
    if (state) {
      // console.log(`Locking ${id}`);
      collectionRef(id).update({ edit: false }).then(() => {
        openSnackbar('Elemento bloccato', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      // console.log(`Unlocking ${id}`);
      collectionRef(id).update({ edit: true }).then(() => {
        openSnackbar('Elemento sbloccato', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const onDeleteRequest = ({ id }: { id: string }): void => {
    setIsOpenDeleteDialog(true);
    setSelectedId(id);
  };

  const onCloseDeleteDialog = (): void => {
    setIsOpenDeleteDialog(false);
    setSelectedId('');
  };

  const onDelete = (): void => {
    setIsOpenDeleteDialog(false);
    collectionRef(selectedId).delete().then((): void => {
      openSnackbar('Elemento cancellato', 'success');
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  };

  if (redirectTo) return (
    <Redirect to={`/collection/${redirectTo}`} />
  );

  const orderByOptions = orderBy.map((option: OrderByModel, index: number) => (
    <MenuItem
      key={option.type}
      disabled={index === -1}
      selected={index === orderByIndex}
      onClick={() => onChangeOrderBy(index)}>
      {option.label}
    </MenuItem>
  ));

  const limitByOptions = limitBy.map((option: number, index: number) => (
    <MenuItem
      key={option}
      disabled={index === -1}
      selected={index === limitByIndex}
      onClick={() => onChangeLimitBy(index)}>
      {option}
    </MenuItem>
  ));

  const skeletons = [...Array(limit)].map((_, i: number) => <li key={i} className='avatar-row skltn dash' />);

  const itemsList = loading ? skeletons : !items ? (
    <li className='empty text-center'>Nessun elemento</li>
  ) : (
    items.map(({ books_num, description, edit, lastEditBy, lastEditByUid, lastEdit_num, title }: CollectionModel) => (
      <li key={title} className={classnames({ locked: !edit })}>
        <div className='row'>
          <Link to={`/collection/${normURL(title)}`} className='col'>
            {title}
          </Link>
          <div className='col-1'>{books_num}</div>
          <div className='col-5 col-lg-8' title={description}>{description}</div>
          <Link to={`/dashboard/${lastEditByUid}`} title={lastEditByUid} className='col col-sm-2 col-lg-1'>{lastEditBy}</Link>
          <div className='col col-sm-2 col-lg-1 text-right'>
            <div className='timestamp'>{timeSince(lastEdit_num)}</div>
          </div>
          <div className='absolute-row right btns xs'>
            <button type='button' className='btn icon green' onClick={() => onView({ id: title })} title='Anteprima'>{icon.eye}</button>
            <button type='button' className='btn icon primary' onClick={() => onEdit({ id: title })} title='Modifica'>{icon.pencil}</button>
            <button type='button' className={classnames('btn', 'icon', edit ? 'secondary' : 'flat')} onClick={() => onLock({ id: title, state: edit })} title={edit ? 'Blocca' : 'Sblocca'}>{icon.lock}</button>
            <button type='button' className='btn icon red' onClick={() => onDeleteRequest({ id: title })}>{icon.close}</button>
          </div>
        </div>
      </li>
    ))
  );

  const sitemapData = items.map(item => ([
    `<url> <loc>${app.url}/collection/${normURL(item.title)}</loc> </url>`
  ]));

  return (
    <Fragment>
      <div className='head nav'>
        <div className='row'>
          <div className='col'>
            <span className='counter hide-md'>{`${items.length || 0} di ${count || 0}`}</span>
            <button
              type='button'
              className='btn sm flat counter last'
              disabled={!items.length}
              onClick={onOpenLimitMenu}
            >
              {limitBy[limitByIndex]} <span className='hide-xs'>per pagina</span>
            </button>
            <Menu 
              className='dropdown-menu'
              anchorEl={limitMenuAnchorEl} 
              open={Boolean(limitMenuAnchorEl)} 
              onClose={onCloseLimitMenu}>
              {limitByOptions}
            </Menu>
          </div>
          {Boolean(items.length) && (
            <div className='col-auto'>
              <CSVLink data={sitemapData} className='counter' filename='sitemap_collections.csv'>Sitemap</CSVLink>
              <button
                type='button'
                className='btn sm flat counter'
                onClick={onOpenOrderMenu}
              >
                <span className='hide-xs'>Ordina per</span> {orderBy[orderByIndex].label}
              </button>
              <Menu 
                className='dropdown-menu'
                anchorEl={orderMenuAnchorEl} 
                open={Boolean(orderMenuAnchorEl)} 
                onClose={onCloseOrderMenu}>
                {orderByOptions}
              </Menu>
              <button
                type='button'
                className={classnames('btn', 'sm', 'flat', 'counter', 'icon', 'rounded', desc ? 'desc' : 'asc')}
                title={desc ? 'Ascendente' : 'Discendente'}
                onClick={onToggleDesc}
              >
                {icon.arrowDown}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ul className='table dense nolist font-sm'>
        <li className='labels'>
          <div className='row'>
            <div className='col'>Titolo</div>
            <div className='col-1'>Libri</div>
            <div className='col-5 col-lg-8'>Descrizione</div>
            <div className='col col-sm-2 col-lg-1'>Modificato da</div>
            <div className='col col-sm-2 col-lg-1 text-right'>Modificato</div>
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
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ricordati di rimuovere il riferimento alla collezione nei singoli libri.
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>Annulla</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
};

export default CollectionsDash;